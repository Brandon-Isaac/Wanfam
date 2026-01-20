import { FeedingInventory } from "../models/FeedingInventory";
import { Request, Response } from "express";

const getAllInventoryItems = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
     try {
        const items = await FeedingInventory.find({ farmId });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

const getInventoryItemById = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    try {
        const item = await FeedingInventory.findOne({ _id: req.params.id, farmId });
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

const createInventoryItem = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { itemName, quantity, price, category, supplier, lastRestocked } = req.body;
    try {
        const newItem = new FeedingInventory({
            farmId,
            itemName,
            quantity,
            price,
            category,
            supplier,
            lastRestocked
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

const updateInventoryItem = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    try {
        const item = await FeedingInventory.findOneAndUpdate(
            { _id: req.params.id, farmId },
            req.body,
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

const deleteInventoryItem = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    try {
        const item = await FeedingInventory.findOneAndDelete({ _id: req.params.id, farmId });
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const InventoryController = {
    getAllInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};