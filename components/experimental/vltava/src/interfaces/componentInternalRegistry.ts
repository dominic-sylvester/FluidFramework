/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IFluidObject, IComponent } from "@fluidframework/component-core-interfaces";
import { IProvideComponentFactory } from "@fluidframework/runtime-definitions";

declare module "@fluidframework/component-core-interfaces" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface IComponent extends Readonly<Partial<IProvideComponentInternalRegistry>> { }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface IFluidObject extends Readonly<Partial<IProvideComponentInternalRegistry>> { }
}

export const IComponentInternalRegistry: keyof IProvideComponentInternalRegistry = "IComponentInternalRegistry";

export interface IProvideComponentInternalRegistry {
    readonly IComponentInternalRegistry: IComponentInternalRegistry;
}

/**
 * Provides functionality to retrieve subsets of an internal registry.
 */
export interface IComponentInternalRegistry extends IProvideComponentInternalRegistry {
    getFromCapability(type: keyof (IFluidObject & IComponent)): IInternalRegistryEntry[];
    hasCapability(type: string, capability: keyof (IFluidObject & IComponent)): boolean;
}

/**
 * A registry entry, with extra metadata.
 */
export interface IInternalRegistryEntry {
    type: string;
    factory: Promise<IProvideComponentFactory>;
    capabilities: (keyof (IFluidObject & IComponent))[];
    friendlyName: string;
    fabricIconName: string;
}
