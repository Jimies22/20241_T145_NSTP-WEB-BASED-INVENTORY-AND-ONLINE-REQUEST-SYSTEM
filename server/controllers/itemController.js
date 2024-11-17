import Item from "../models/itemModel.js";
import { generateItemBarcode } from "../services/barcode.js";

// Create a new item
export const createItem = async (req, res) => {
  try {
    // Generate item ID and barcode
    const { itemId, barcodeBuffer } = await generateItemBarcode();

    // Extract data from request body
    const { name, description, photo } = req.body;

    // Create new item with generated ID and barcode, plus request body data
    const newItem = await Item.create({
      item_id: itemId,
      name,
      description,
      photo: Buffer.from(photo, "base64"), // Convert base64 photo to Buffer
      isArchived: false, // Set default archived status
    });

    res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all active items (not archived)
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false }); // Filter for active items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single item by ID
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an item by ID
export const updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Archive an item by ID
export const archiveItem = async (req, res) => {
  try {
    const archivedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { isArchived: true }, // Set isArchived to true
      { new: true, runValidators: true }
    );
    if (!archivedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res
      .status(200)
      .json({ message: "Item archived successfully", archivedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restore an archived item by ID (optional, if needed)
export const restoreItem = async (req, res) => {
  try {
    const restoredItem = await Item.findByIdAndUpdate(
      req.params.id,
      { isArchived: false }, // Set isArchived back to false
      { new: true, runValidators: true }
    );
    if (!restoredItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res
      .status(200)
      .json({ message: "Item restored successfully", restoredItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
