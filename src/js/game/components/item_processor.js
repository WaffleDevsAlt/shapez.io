import { BaseItem } from "../base_item";
import { Component } from "../component";
import { enumDirection, Vector } from "../../core/vector";

/** @enum {string} */
export const enumItemProcessorTypes = {
    splitter: "splitter",
    cutter: "cutter",
    rotater: "rotater",
    stacker: "stacker",
    trash: "trash",
    mixer: "mixer",
    painter: "painter",
    hub: "hub",
};

export class ItemProcessorComponent extends Component {
    static getId() {
        return "ItemProcessor";
    }

    static getSchema() {
        return {
            // TODO
        };
    }

    /**
     *
     * @param {object} param0
     * @param {enumItemProcessorTypes} param0.processorType Which type of processor this is
     * @param {number} param0.inputsPerCharge How many items this machine needs until it can start working
     * @param {Array<{pos: Vector, direction: enumDirection}>=} param0.beltUnderlays Where to render belt underlays
     *
     */
    constructor({ processorType = enumItemProcessorTypes.splitter, inputsPerCharge, beltUnderlays = [] }) {
        super();

        // Which slot to emit next, this is only a preference and if it can't emit
        // it will take the other one. Some machines ignore this (e.g. the splitter) to make
        // sure the outputs always match
        this.nextOutputSlot = 0;

        // Type of the processor
        this.type = processorType;

        // How many inputs we need for one charge
        this.inputsPerCharge = inputsPerCharge;

        // Which belt underlays to render
        this.beltUnderlays = beltUnderlays;

        /**
         * Our current inputs
         * @type {Array<{ item: BaseItem, sourceSlot: number }>}
         */
        this.inputSlots = [];

        /**
         * What we are currently processing, empty if we don't produce anything rn
         * requiredSlot: Item *must* be ejected on this slot
         * preferredSlot: Item *can* be ejected on this slot, but others are fine too if the one is not usable
         * @type {Array<{item: BaseItem, requiredSlot?: number, preferredSlot?: number}>}
         */
        this.itemsToEject = [];

        /**
         * How long it takes until we are done with the current items
         */
        this.secondsUntilEject = 0;

        /**
         * Fixes belt animations
         * @type {Array<{ item: BaseItem, slotIndex: number, animProgress: number, direction: enumDirection}>}
         */
        this.itemConsumptionAnimations = [];
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     */
    tryTakeItem(item, sourceSlot, sourceDirection) {
        if (this.inputSlots.length >= this.inputsPerCharge) {
            // Already full
            return false;
        }

        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        this.itemConsumptionAnimations.push({
            item,
            slotIndex: sourceSlot,
            direction: sourceDirection,
            animProgress: 0.0,
        });
        return true;
    }
}