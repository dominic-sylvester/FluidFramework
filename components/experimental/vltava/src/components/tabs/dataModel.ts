/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from "events";

import { IFluidObject, IComponentHandle, IComponentLoadable } from "@fluidframework/component-core-interfaces";
import {
    ISharedDirectory,
    IDirectory,
    IDirectoryValueChanged,
} from "@fluidframework/map";
import {
    ISequencedDocumentMessage,
} from "@fluidframework/protocol-definitions";

import { v4 as uuid } from "uuid";

import { IComponentInternalRegistry } from "../../interfaces";

export interface ITabsTypes {
    type: string;
    friendlyName: string;
    fabricIconName: string;
}

export interface ITabsModel {
    type: string;
    handleOrId?: IComponentHandle | string;
}

export interface ITabsDataModel extends EventEmitter {
    getComponentTab(id: string): Promise<IFluidObject | undefined>;
    getTabIds(): string[];
    createTab(type: string): Promise<string>;
    getNewTabTypes(): ITabsTypes[];
}

export class TabsDataModel extends EventEmitter implements ITabsDataModel {
    private tabs: IDirectory;

    constructor(
        public root: ISharedDirectory,
        private readonly internalRegistry: IComponentInternalRegistry,
        private readonly createAndAttachComponent: <T extends IFluidObject & IComponentLoadable>
            (pkg: string, props?: any) => Promise<T>,
        private readonly getComponentFromDirectory: <T extends IFluidObject & IComponentLoadable>(
            id: string,
            directory: IDirectory,
            getObjectFromDirectory?: (id: string, directory: IDirectory) => string | IComponentHandle | undefined) =>
            Promise<T | undefined>,
    ) {
        super();

        this.tabs = root.getSubDirectory("tab-ids");

        root.on(
            "valueChanged",
            (
                changed: IDirectoryValueChanged,
                local: boolean,
                op: ISequencedDocumentMessage,
                target: ISharedDirectory,
            ) => {
                if (changed.path === this.tabs.absolutePath && !local) {
                    this.emit("newTab", local);
                }
            });
    }

    public getTabIds(): string[] {
        return Array.from(this.tabs.keys());
    }

    public async createTab(type: string): Promise<string> {
        const newKey = uuid();
        const component = await this.createAndAttachComponent<IFluidObject & IComponentLoadable>(type);
        this.tabs.set(newKey, {
            type,
            handleOrId: component.handle,
        });

        this.emit("newTab", true);
        return newKey;
    }

    private getObjectFromDirectory(id: string, directory: IDirectory): string | IComponentHandle | undefined {
        const data = directory.get<ITabsModel>(id);
        return data?.handleOrId;
    }

    public async getComponentTab(id: string): Promise<IFluidObject | undefined> {
        this.tabs = this.root.getSubDirectory("tab-ids");
        return this.getComponentFromDirectory(id, this.tabs, this.getObjectFromDirectory);
    }

    public getNewTabTypes(): ITabsTypes[] {
        const response: ITabsTypes[] = [];
        this.internalRegistry.getFromCapability("IComponentHTMLView").forEach((e) => {
            response.push({
                type: e.type,
                friendlyName: e.friendlyName,
                fabricIconName: e.fabricIconName,
            });
        });
        return response;
    }
}
