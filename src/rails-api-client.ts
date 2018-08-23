export class RailsApiClient {
    public domain: string;
    public isAuth = false;
    private accessToken: string;
    constructor(domain: string) {
        this.domain = domain;
    }

    public setAccessToken(token: string) {
        this.accessToken = token;
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

    public buildUrl(model: string, id: number | null, apiVersion?: string): string {
        const baseApiUrl = `${this.domain}api/${(apiVersion || 'v1')}`;
        return this.buildResource(baseApiUrl, model, id);
    }

    public buildResource(url: string, model: string, id: number | null = null): string {
        return `${url}/${model}${id != null ? ('/' + id) : ''}`;
    }

    public callApi(url: string, method: string, body: any = null): Promise<any> {
        let jsonBody: string = null;
        if (body) {
            body = this.toSnakeCase(body);
            jsonBody = JSON.stringify(body);
        }


        return fetch(url, {
            body: jsonBody,
            headers: this.headers(),
            method,
        }).then(res => {
            console.log(`${url} Response:`, res);
            return res.json().then(json => {
                const camelJson = this.toCamelCase(json);
                camelJson._res = res;
                switch (res.status) {
                    case 200:
                        console.log(`${url} Success:`, camelJson);
                        break;
                    case 404:
                        console.warn(`${url} Warning:`, camelJson);
                        throw camelJson;
                    default:
                        console.error(`${url} Failure:`, camelJson);
                        throw camelJson;
                }
                return camelJson;
            });
        });
    }

    private toCamelCase(obj: any): any {
        let newObj = {};
        if (Array.isArray(obj)) {
            newObj = [];
        }
        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                if (obj[d] == null) {
                    newObj[d.split(/(?=[A-Z])/).join('_').toLowerCase()] = null;
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

    private toSnakeCase(obj: {}): any {
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


}
