import {action, observable} from "mobx";
import StoreBase, {IModel, Mode, State} from "./StoreBase";
import stores from "../../admin/stores";

export interface INotifyMastodon extends IModel {
    baseurl: string;
    token: string;
    template: string;
}

export interface IRender extends IModel {
    entries: boolean;
    entry: boolean;
}

export interface ICloudflare extends IModel {
    enable: boolean;
    zone_id: string;
    api_token: string;
}

export class SettingsStore extends StoreBase {
    @observable
    public siteTitle: string;

    @observable
    public sideNavContents: string[];

    @observable
    public notifyMastodon: INotifyMastodon;

    @observable.shallow
    public render: IRender;

    @observable
    public mongoDbQueryCache: boolean;

    @observable
    public ssrPageCache: boolean;

    @observable.shallow
    public cloudflare: ICloudflare;

    constructor() {
        super();

        this.siteTitle = "";
        this.sideNavContents = [];
        this.notifyMastodon = {} as INotifyMastodon;
        this.render = {
            entries: false,
            entry: false,
        } as IRender;
        this.mongoDbQueryCache = false;
        this.ssrPageCache = false;
        this.cloudflare = {
            enable: false,
            zone_id: "",
            api_token: "",
        } as ICloudflare;
    }

    @action
    public async getSiteTitle() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/site/title`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.siteTitle = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("サイト情報の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setSiteTitle(title: string) {
        this.siteTitle = title
    }

    @action
    public async putSiteTitle() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/site/title`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify({
                    key: "",
                    value: this.siteTitle,
                }),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.siteTitle = result.value;

            this.tryShowToast("サイト情報を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("サイト情報の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getSideNavContents() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/site/sidenav`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(false),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            if (result.value.length == 0) {
                this.sideNavContents = [""];
            } else {
                this.sideNavContents = result.value;
            }

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("サイドバーコンテンツの取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setSideNavContents(sideNavContents: string[]) {
        this.sideNavContents = sideNavContents
    }

    @action
    public async putSideNavContents() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/site/sidenav`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify({
                    key: "",
                    value: this.sideNavContents,
                }),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.sideNavContents = result.value;

            this.tryShowToast("サイドバーコンテンツを編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("サイドバーコンテンツの保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getNotifyMastodon() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/notify/mastodon`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.notifyMastodon = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("Mastodon通知の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setNotifyMastodon(notifyMastodon: INotifyMastodon) {
        this.notifyMastodon = notifyMastodon
    }

    @action
    public async putNotifyMastodon() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/notify/mastodon`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify(this.notifyMastodon),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.notifyMastodon = result.value;

            this.tryShowToast("Mastodon通知を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("Mastodon通知の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getRender() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/render/server`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.render = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("レンダリング設定の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setRender(render: IRender) {
        this.render = render;
    }

    @action
    public async putRender() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/render/server`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify(this.render),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.render = result.value;

            this.tryShowToast("レンダリング設定を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("レンダリング設定の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getMongoDbQueryCache() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/mongodb`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.mongoDbQueryCache = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setMongoDbQueryCache(enable: boolean) {
        this.mongoDbQueryCache = enable;
    }

    @action
    public async putMongoDbQueryCache() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/mongodb`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify({
                    value: this.mongoDbQueryCache,
                }),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.mongoDbQueryCache = result.value;

            this.tryShowToast("キャッシュ設定を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getSsrPageCache() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/page`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.ssrPageCache = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setSsrPageCache(enable: boolean) {
        this.ssrPageCache = enable;
    }

    @action
    public async putSsrPageCache() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/page`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify({
                    value: this.ssrPageCache,
                }),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.ssrPageCache = result.value;

            this.tryShowToast("キャッシュ設定を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async getCloudflare() {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/cloudflare`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.cloudflare = result.value;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public setCloudflare(cloudflare: ICloudflare) {
        this.cloudflare = cloudflare;
    }

    @action
    public async putCloudflare() {
        this.setMode(Mode.UPDATE);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/settings/cache/cloudflare`;
            const response = await fetch(url, {
                method: "PUT",
                headers: this.generateFetchHeader(),
                body: JSON.stringify(this.cloudflare),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            const result = await response.json();
            this.cloudflare = result.value;

            this.tryShowToast("キャッシュ設定を編集しました");
            stores.AuthStore.checkAuth();
            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("キャッシュ設定の保存に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }
}
