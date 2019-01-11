export class QueueEntry {
    promiseGenerator: () => Promise<any>;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

export class Queue {
    maxQueue: number;
    _queue = new Array<QueueEntry>();
    _idCount = 0;
    _concurrency: number;
    pendingCount = 0;
    constructor(maxQueue: number, concurrency?: number) {
        this.maxQueue = maxQueue;
        this._concurrency = concurrency || 1;
    }

    public add(promiseGenerator: () => Promise<any>): Promise<any> {
        return new Promise((res, rej) => {
            if (this._queue.length >= this.maxQueue) {
                rej(new Error('Queue limit reached'));
            }

            this._queue.push({
                promiseGenerator: promiseGenerator,
                resolve: res,
                reject: rej
            });

            this.dequeue();
        });
    }

    private dequeue(): boolean {
        if (this.pendingCount >= this._concurrency) {
            return false;
        }

        const item = this._queue.shift();
        if (!item) {
            return false;
        }

        try {
            this.pendingCount++;
            Promise.resolve(item.promiseGenerator())
                .then((value) => {
                    item.resolve(value);
                    this.pendingCount--;
                    this.dequeue();
                }).catch(err => {
                    item.reject(err);
                    this.pendingCount--;
                    this.dequeue();
                });
        } catch (err) {
            item.reject(err);
            this.pendingCount--;
            this.dequeue();
        }
        return true;
    }
}
