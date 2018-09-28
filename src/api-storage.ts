export enum StorageStatus {
    invalid, valid
}

export class StorageItem<T> {
    item: T;
    updatedAt: string;
    status: StorageStatus;
}

export interface Updatable {
    key: string;
    updatedAt: string;
}

export class ApiStorage {
    public static getKey(model: string, id: number): string {
        return `${model}/${id}`;
    }
    public static set(key: string, object: StorageItem<any>) {
        localStorage.setItem(key, JSON.stringify(object));
    }

    public static get(key: string): StorageItem<any> {
        return JSON.parse(localStorage.getItem(key));
    }

    public static process(updatables: Updatable[]) {
        updatables.forEach(updatable => {
            const storedObj = ApiStorage.get(updatable.key);
            if (storedObj != null && new Date(storedObj.updatedAt) < new Date(updatable.updatedAt)) {
                storedObj.status = StorageStatus.invalid;
                console.log("Invalidating object with key:", updatable.key)
                ApiStorage.set(updatable.key, storedObj);
            }
        });
    }
}
