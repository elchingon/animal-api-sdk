import { Injectable, InjectionToken, Inject } from '@angular/core';
import { AnimalSdkConfig, Page, PagingInfo, Question } from './animal-sdk.models';
import { RailsApiClient } from './rails-api-client';

export const AnimalSdkConfigService = new InjectionToken<AnimalSdkConfig>('AnimalSdkConfig');

@Injectable()
export class AnimalSDKService {
    client: RailsApiClient;
    public didLogin: () => void;

    constructor(@Inject(AnimalSdkConfigService) private config: AnimalSdkConfig) {
        console.log('Connecting to Animal Api: ', this.config.domain);
        // this.client = new RailsApiClient(this.config.domain);
        this.client = new RailsApiClient(config.domain);
        this.login();
    }

    /**
     * Get all Pages for animal.
     * @param page The page number
     * @param pageSize The size of the page
     */
    public getPages(page: number, pageSize: number): Promise<PagingInfo<Page>> {
        const url = this.buildAnimalUrl(1, 'pages');
        return this.client.callApi(url + `?page_num=${page}&page_size=${pageSize}`, 'GET').then(res => {
            return { items: res.pages, meta: res.meta };
        });
    }

    /**
     * Get a specific Page for animal.
     * @param id The page identifier
     */
    public getPage(id: number): Promise<Page> {
        const url = this.buildAnimalUrl(1, 'pages', id);
        return this.client.callApi(url, 'GET').then(res => {
            return res;
        });
    }

    /**
     * Get all Questions for animal.
     * @param page The page number
     * @param pageSize The size of the page
     */
    public getQuestions(page: number, pageSize: number): Promise<PagingInfo<Page>> {
        const url = this.buildAnimalUrl(1, 'questions');
        return this.client.callApi(url + `?page_num=${page}&page_size=${pageSize}`, 'GET').then(res => {
            return { items: res.pages, meta: res.meta };
        });
    }
    /**
     * Get a specific Question for animal.
     * @param id The question identifier
     */
    public getQuestion(id: number): Promise<Question> {
        const url = this.buildAnimalUrl(1, 'questions', id);
        return this.client.callApi(url, 'GET').then(res => {
            return res;
        });
    }

    private login() {
        const url = this.client.domain + 'oauth/token';
        this.client.callApi(url, 'POST', {
            clientId: this.config.credientals.clientId,
            clientSecret: this.config.credientals.clientSecret,
            grantType: 'client_credentials'
        }).then(login => {
            this.client.isAuth = true;
            this.client.setAccessToken(login.accessToken);
            this.didLogin();
        });
    }

    private buildAnimalUrl(animalId: number, model: string, id?: number): string {
        return this.client.buildResource(this.client.buildUrl('animals', animalId), model, id);
    }
}
