import { Queue } from './queue';

export class RailsApiClient {
    public domain: string;
    public isAuth = false;
    private accessToken: string;
    public queue = new Queue(Infinity);

    public static toCamelCase(obj: any): any {
        let newObj = {};
        if (typeof obj === 'string') {
            return obj.replace(/(\_\w)/g, (k) => {
                return k[1].toUpperCase();
            });
        }
        if (Array.isArray(obj)) {
            newObj = [];
        }
        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                if (obj[d] == null) {
                    newObj[d.replace(/(\_\w)/g, (k) => {
                        return k[1].toUpperCase();
                    })] = null;
                    continue;
                }
                if (typeof obj[d] === 'object') {
                    obj[d] = this.toCamelCase(obj[d]);
                }
                newObj[d.replace(/(\_\w)/g, (k) => {
                    return k[1].toUpperCase();
                })] = obj[d];
            }
        }
        return newObj;
    }

    public static toSnakeCase(obj: {}): any {
        const newObj = {};

        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                if (obj[d] == null) {
                    newObj[d.split(/(?=[A-Z])/).join('_').toLowerCase()] = null;
                    continue;
                }
                if (typeof obj[d] === 'object') {
                    obj[d] = this.toSnakeCase(obj[d]);
                }
                newObj[d.split(/(?=[A-Z])/).join('_').toLowerCase()] = obj[d];
            }
        }
        return newObj;
    }

    constructor(domain: string) {
        this.domain = domain;
    }

    public setAccessToken(token: string) {
        this.accessToken = token;
        this.isAuth = true;
    }

    private headers(): HeadersInit {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json'
        };

        if (this.isAuth) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    public buildUrl(model: string, id?: number, apiVersion?: string): string {
        const baseApiUrl = `${this.domain}api/${(apiVersion || 'v1')}`;
        return this.buildResource(baseApiUrl, model, id);
    }

    public buildResource(url: string, model: string, id: number | null = null): string {
        return `${url}/${model}${id != null ? ('/' + id) : ''}`;
    }

    public callApi(url: string | (() => string),
        method: string,
        params: any = null,
        then: (value?: any) => void = (value?: any) => { }): Promise<any> {

        return this.queue.add(() => {
            let jsonBody: string = null;
            let fullUrl = url;
            if (typeof fullUrl === 'function') {
                fullUrl = fullUrl();
            }
            if (method === 'GET') {
                if (params) {
                    params = RailsApiClient.toSnakeCase(params);

                    const query = Object.keys(params).map(key => {
                        const val = params[key];
                        if (!val) {
                            return null;
                        }
                        return `${key}=${params[key]}`;
                    }).filter(val => val != null).join('&');
                    fullUrl += '?' + query;
                }
            } else {
                if (params) {
                    params = RailsApiClient.toSnakeCase(params);
                    jsonBody = JSON.stringify(params);
                }
            }
            return fetch(fullUrl, {
                body: jsonBody,
                headers: this.headers(),
                method,
            }).then(res => {
                console.log(`${fullUrl} Response:`, res);
                return res.json().then(json => {
                    const camelJson = RailsApiClient.toCamelCase(json);
                    camelJson._res = res;
                    switch (true) {
                        case (res.status >= 200 && res.status < 300):
                            console.log(`${fullUrl} Success:`, camelJson);
                            break;
                        case (res.status === 404):
                            console.warn(`${fullUrl} Warning:`, camelJson);
                            throw camelJson;
                        default:
                            console.error(`${fullUrl} Failure:`, camelJson);
                            throw camelJson;
                    }
                    return camelJson;
                });
            }).then(json => {
                then(json);
                return json;
            });
        });
    }
}
