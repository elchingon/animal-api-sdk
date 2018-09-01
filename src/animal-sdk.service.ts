import { Injectable, InjectionToken, Inject } from '@angular/core';
import {
    AnimalSdkConfig, Page, PagingInfo, Question, BasicPage, Animal,
    AskQuestion, MenuItem, BasicMonth, UrlParams, Month
} from './animal-sdk.models';
import { RailsApiClient } from './rails-api-client';
import { ApiStorage, StorageStatus, StorageItem } from './api-storage';

export const AnimalSdkConfigService = new InjectionToken<AnimalSdkConfig>('AnimalSdkConfig');

export class AnimalModelService<T, K> {
    client: RailsApiClient;
    model: string;
    animalGen: () => Animal;
    constructor(client: RailsApiClient, model: string, animalGenerator: () => Animal) {
        this.client = client;
        this.model = model;
        this.animalGen = animalGenerator;
    }

    /**
     *  Get all for objects for this model.
     * @param params url parameters
     */
    public getAll(params: UrlParams = { pageNum: 1, pageSize: 20, search: null }): Promise<PagingInfo<K>> {
        const camelModel = RailsApiClient.toCamelCase(this.model);
        if(!params.sort) {
            params.sort = 'created_at desc'
        }
        return this.client.callApi(() => this.buildAnimalUrl(this.animalGen().id), 'GET',
            params).then(res => {
                ApiStorage.process(res[camelModel].map(p => {
                    return { id: p.id, model: this.model, updatedAt: p.updatedAt };
                }));
                return { items: res[camelModel], meta: res.meta };
            });
    }

    /**
     * Get an object by identifier.
     * @param id The model identifier
     */
    public get(id: number): Promise<T> {
        const key = ApiStorage.getKey(this.model, id);
        const storedObj = ApiStorage.get(key);
        if (storedObj && storedObj.status === StorageStatus.valid) {
            console.log(`Returning cached ${this.model}:`, storedObj);
            return new Promise((res) => { return res(storedObj.item); });
        } else {
            console.log(`Fetching ${this.model} with id: ${id}`);
            return this.client.callApi(() => this.buildAnimalUrl(this.animalGen().id, id), 'GET', null, (json: Page) => {
                ApiStorage.set(key, { item: json, status: StorageStatus.valid, updatedAt: json.updatedAt });
            });
        }
    }

    protected buildAnimalUrl(animalId: number, id?: number): string {
        return this.client.buildResource(this.client.buildUrl('animals', animalId), this.model, id);
    }
}

export class AnimalPageService extends AnimalModelService<Page, BasicPage> {
    public getAllPublished(params: UrlParams = { pageNum: 1, pageSize: 20, search: null }): Promise<PagingInfo<BasicPage>> {
        params.search = 'status=1,page_type=log';
        return this.getAll(params);
    }
}

export class AnimalMonthService extends AnimalModelService<Month, BasicMonth> {
    private monthDiff(d1: Date, d2: Date): number {
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    /**
     * Returns the current Month which the animal is in its pregnancy.
     */
    public current(): Promise<number> {
        return this.client.queue.add(() => {
            return new Promise((res, rej) => {
                res(this.monthDiff(new Date(this.animalGen().conceivedOn), new Date()) + 1);
            });
        });
    }

    /**
     * Get all months in order by month number.
     * @param params The url params.
     */
    public getAllOrdered(params: UrlParams = { pageNum: 1, pageSize: 20, search: null }): Promise<PagingInfo<BasicMonth>> {
        params.sort = 'number asc';
        return this.getAll(params);
    }
}

export class AnimalQuestionService extends AnimalModelService<Question, Question> {
    public getAllAnswered(params: UrlParams = { pageNum: 1, pageSize: 20, search: null }) {
        params.search = 'response != nil';
        return this.getAll(params);
    }

    public ask(question: AskQuestion): Promise<Question> {
        return this.client.callApi(() => this.buildAnimalUrl(this.animalGen().id), 'POST', { question });
    }
}

export class AnimalMenuItemService extends AnimalModelService<MenuItem, MenuItem> { }

@Injectable()
export class AnimalSDKService {
    client: RailsApiClient;
    currentAnimal: Animal;
    public pages: AnimalPageService;
    public months: AnimalMonthService;
    public menuItems: AnimalMenuItemService;
    public questions: AnimalQuestionService;
    constructor(@Inject(AnimalSdkConfigService) private config: AnimalSdkConfig) {
        console.log('Connecting to Animal Api: ', this.config.domain);
        this.client = new RailsApiClient(config.domain);
        this.login();
        this.getAnimal(1);
        this.pages = new AnimalPageService(this.client, 'pages', () => this.currentAnimal);
        this.months = new AnimalMonthService(this.client, 'months', () => this.currentAnimal);
        this.menuItems = new AnimalMenuItemService(this.client, 'menu_items', () => this.currentAnimal);
        this.questions = new AnimalQuestionService(this.client, 'questions', () => this.currentAnimal);
    }

    /**
     * Get a specific Animal.
     * @param id The animal identifier
     */
    public getAnimal(id: number): Promise<Animal> {
        const url = this.client.buildUrl('animals', id);
        return this.client.callApi(url, 'GET', null, json => {
            this.currentAnimal = json;
            console.log('Current Animal:', this.currentAnimal);
        });
    }

    private login() {
        const url = this.client.domain + 'oauth/token';
        console.log('Logging In');
        this.client.callApi(url, 'POST', {
            clientId: this.config.credientals.clientId,
            clientSecret: this.config.credientals.clientSecret,
            grantType: 'client_credentials'
        }, json => {
            this.client.setAccessToken(json.accessToken);
            return json;
        });
    }
}
