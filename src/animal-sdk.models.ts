export interface AnimalApiCredentials {
    /**
     * The client identifier of oauth application.
     */
    clientId: string;
    /**
     * The client secret of oauth application.
     */
    clientSecret: string;
}

export interface AnimalSdkConfig {
    /**
     * The domain that the SDK should use in API calls.
     */
    domain: string;
    /**
     * The client credientals used when connecting to API.
     */
    credientals: AnimalApiCredentials;
}

export interface PageImage {
    /**
     * Image identifier.
     */
    id: number;
    /**
     * Url to the image.
     */
    url: string;
    /**
     * Image's filename.
     */
    filename: string;
}


export interface Page {
    /**
     * The page identifier.
     */
    id: number;
    /**
     * The page title.
     */
    title: string;
    /**
     * The page description.
     */
    description: string;
    /**
     * The page body.
     */
    body: string;
    /**
     * The page status.
     * "draft", "published"
     */
    status: string;
    pageType: string;
    /**
     * A link to a video associated with this page.
     */
    videoUrl?: string;
    /**
     * A link to more information about this page.
     */
    moreInfoUrl?: string;
    /**
     * An array of images associated with this page.
     */
    imageUrls: [PageImage];
    /**
     * The last time this post was updated.
     */
    updatedAt: Date;
}

export interface Question {
    /** Question Identifier */
    id: number;
}

export interface PagingMeta {
    /**
     * The number of total pages.
     */
    pageCount: number;
    /**
     * The number of items per page.
     */
    pageSize: number;
}

export interface PagingInfo<T> {
    /**
     * Items in the page.
     */
    items: [T];
    /**
     * Paging information used when paginating.
     */
    meta: PagingMeta;
}
