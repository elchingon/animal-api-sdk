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
    /**
     * The application id to register device token under for push notifications.
     */
    e7PushAppId?: string
}

export interface Animal {
    /**
     * Animal Identifier
     */
    id: number;
    /**
     * The animals name.
     */
    name: string;
    /**
     * The date the animal got pregenant.
     */
    conceivedOn: string;
    /**
     * The animals stream url.
     */
    streamUrl: string;
}

/***************
 * Page Models
 ***************/
export interface BasicPage {
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
     * The type of page.
     * "log", "month"
     */
    pageType: string;
    /**
     * An array of images associated with this page.
     */
    imageUrls: [PageImage];
    /**
     * The time this page was created.
     */
    createdAt: string;
    /**
     * The last time this page was updated.
     */
    updatedAt: string;
}

export interface Page extends BasicPage {
    /**
     * The page status.
     * "draft", "published"
     */
    status: string;
    /**
     * A link to a video associated with this page.
     */
    videoUrl?: string;
    /**
     * A link to more information about this page.
     */
    moreInfoUrl?: string;
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

/*****************
 * Question Models
 *****************/
export interface Question {
    /** Question Identifier */
    id: number;
    /** The full name of the person who asked the question. */
    name: string;
    /** The email of the person who asked the question. */
    email: string;
    /** The question that was asked. */
    text: string;
    /** The status of the question
     *  "asked", "answered"
     */
    status: string;
    /** The response to the question. */
    response: string;
    /** The user id of the person who responsed. */
    respondedById: number;
    /** The date the question was created. */
    createdAt: string;
    /** The date the question was updated */
    updatedAt: string;
}

export interface AskQuestion {
    /** The full name of the person who asked the question. */
    name: string;
    /** The email of the person who asked the question. */
    email: string;
    /** The question that was asked. */
    text: string;
}

/********************
 *  Menu Item Models
 ********************/

export interface MenuItem {
    /** MenuItem Identifier */
    id: number;
    /** The page identifier this menu item should go to. */
    pageId: number;
    /** The position on the menu item in the side bar. */
    position: number;
    /** The name of the menu item. */
    name: string;
}

/******************
 *  Paging Models
 ******************/
/** Models used for pagination. */

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

/*********
 * Month
 *********/
export interface BasicMonth {
    /** The month identifier */
    id: number;
    /** The month number */
    number: number;
    /** Basic Page Information */
    page: BasicPage;
    /** Timestamp of the last time either the month or the page was updated. */
    updatedAt: string;
}

export interface Month extends BasicMonth {
    /** The name of the month (This will override the page title) */
    name: string;
    /** The animal identifier this Month is for. */
    animalId: number
}


/*********
 * Others
 *********/

export interface UrlParams {
    pageNum?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
}
