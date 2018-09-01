import { Injectable, InjectionToken, Inject } from '@angular/core';
import {
    AnimalSdkConfig, Page, PagingInfo, Question, BasicPage, Animal,
    AskQuestion, MenuItem, BasicMonth, UrlParams, Month
} from './animal-sdk.models';
import { RailsApiClient } from './rails-api-client';
import { ApiStorage, StorageStatus } from './api-storage';

export const AnimalSdkConfigService = new InjectionToken<AnimalSdkConfig>('AnimalSdkConfig');

export interface ModelServiceOptions {
    /** Whether or not the service should use caching. */
    cache: boolean;
    /** The default sort string. */
    defaultSort: string;
    /** A function that generators the path using the model */
    pathGenerator?: (model: string) => string;
    /** A function that generators the key that will be used in ApiStorage when cache is ON. */
    keyGenerator?: (id: number) => string;
}

const defaultOptions: ModelServiceOptions = { cache: false, defaultSort: 'created_at desc' };

export class ModelService<Model, BasicModel> {
    client: RailsApiClient;
    model: string;
    protected get camelModel() {
        return RailsApiClient.toCamelCase(this.model);
    }
    protected get modelUrl() {
        return this.client.buildUrl(this.path);
    }
    protected get path() {
        let path = this.model;
        if (this.options.pathGenerator) {
            path = this.options.pathGenerator(this.model);
        }
        return path;
    }
    options: ModelServiceOptions;

    constructor(client: RailsApiClient, model: string, options: ModelServiceOptions = defaultOptions) {
        this.client = client;
        this.model = model;
        this.options = options;
    }

    private keyGenerator(id: number): string {
        return this.options.keyGenerator ? this.options.keyGenerator(id) : ApiStorage.getKey(this.path, id);
    }
    /**
     *  Get all for objects for this model.
     * @param params url parameters
     */
    public getAll(params: UrlParams = { pageNum: 1, pageSize: 20 }): Promise<PagingInfo<BasicModel>> {
        params.sort = params.sort || this.options.defaultSort;
        return this.client.callApi(() => this.modelUrl, 'GET',
            params).then(res => {
                if (this.options.cache) {
                    ApiStorage.process(res[this.camelModel].map(p => {
                        return { id: p.id, model: this.model, updatedAt: p.updatedAt };
                    }));
                }
                return { items: res[this.camelModel], meta: res.meta };
            });
    }

    /**
     * Get an object by identifier.
     * @param id The model identifier
     */
    public get(id: number, internal?: (json: any) => void): Promise<Model> {
        const key = this.keyGenerator(id);
        const storedObj = ApiStorage.get(key);

        if (this.options.cache && storedObj && storedObj.status === StorageStatus.valid) {
            console.log(`Returning cached ${this.model}:`, storedObj);
            return new Promise((res) => {
                if (internal) { internal(storedObj.item); }
                return res(storedObj.item);
            });
        } else {
            console.log(`Fetching ${this.model}/${id}`);
            return this.client.callApi(() => `${this.modelUrl}/${id}`, 'GET', null, json => {
                if (internal) { internal(json); }
                if (this.options.cache) {
                    ApiStorage.set(key, { item: json, status: StorageStatus.valid, updatedAt: json.updatedAt });
                }
            });
        }
    }
}

export class PageService extends ModelService<Page, BasicPage> {
    /**
     * Get all the published log pages.
     * aka search = 'status=1,page_type=log'
     * @param params url parameters
     */
    public getAllPublished(params: UrlParams = { pageNum: 1, pageSize: 20 }): Promise<PagingInfo<BasicPage>> {
        params.search = 'status=1,page_type=log';
        return this.getAll(params);
    }
}

export interface MonthServiceOptions extends ModelServiceOptions {
    /** A function that generators a Animal */
    animalGenerator: () => Animal;
}

export class MonthService extends ModelService<Month, BasicMonth> {
    animalGenerator: () => Animal;

    constructor(client: RailsApiClient, model: string, options: MonthServiceOptions) {
        super(client, model, options);
        this.animalGenerator = options.animalGenerator;
    }

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
            return new Promise((res) => {
                res(this.monthDiff(new Date(this.animalGenerator().conceivedOn), new Date()) + 1);
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

export class QuestionService extends ModelService<Question, Question> {
    /**
     * Get only answered Questions.
     * aka search = 'response != nil'
     * @param params url parameters
     */
    public getAllAnswered(params: UrlParams = { pageNum: 1, pageSize: 20, search: null }) {
        params.search = 'response != nil';
        return this.getAll(params);
    }

    /**
     * Create a question with no answer.
     * @param question Object used to create a question.
     */
    public ask(question: AskQuestion): Promise<Question> {
        return this.client.callApi(this.modelUrl, 'POST', { question });
    }
}

export class MenuItemService extends ModelService<MenuItem, MenuItem> { }

export interface AnimalServiceOptions extends MonthServiceOptions { }
export class AnimalService extends ModelService<Animal, Animal> {
    animalGenerator: () => Animal;
    constructor(client: RailsApiClient, model: string, options: MonthServiceOptions) {
        super(client, model, options);
        this.animalGenerator = options.animalGenerator;
    }

    public current(): Promise<Animal> {
        return this.client.queue.add(() => {
            return new Promise(res => {
                return res(this.animalGenerator());
            });
        });
    }
}

@Injectable()
export class AnimalSDKService {
    protected client: RailsApiClient;
    private currentAnimal: Animal;
    public pages: PageService;
    public months: MonthService;
    public menuItems: MenuItemService;
    public questions: QuestionService;
    public animals: AnimalService;

    constructor(@Inject(AnimalSdkConfigService) private config: AnimalSdkConfig) {
        console.log('Connecting to Animal Api: ', this.config.domain);
        this.client = new RailsApiClient(config.domain);
        const sortByCreated = 'created_at desc';
        const animalGen = () => this.currentAnimal;
        const animalPathGen = (model: string) => {
            return `animals/${this.currentAnimal.id}/${model}`;
        };
        const nestedOptions: ModelServiceOptions = {
            cache: true,
            defaultSort: sortByCreated,
            pathGenerator: animalPathGen
        };
        this.pages = new PageService(this.client, 'pages', nestedOptions);
        this.menuItems = new MenuItemService(this.client, 'menu_items', nestedOptions);
        this.questions = new QuestionService(this.client, 'questions', nestedOptions);

        this.months = new MonthService(this.client, 'months', {
            cache: true,
            defaultSort: sortByCreated,
            pathGenerator: animalPathGen,
            animalGenerator: animalGen
        });

        this.animals = new AnimalService(this.client, 'animals', {
            cache: false,
            defaultSort: sortByCreated,
            animalGenerator: animalGen
        });

        this.login();
        this.animals.get(1, animal => {
            this.currentAnimal = animal;
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
