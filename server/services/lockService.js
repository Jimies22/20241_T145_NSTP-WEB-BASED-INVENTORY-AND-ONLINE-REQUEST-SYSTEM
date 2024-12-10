const Lock = require("../models/Lock");

const lockService = {
    getLockStatus: async (button) => {
        try {
            const lock = await Lock.findOne({ button });
            return lock;
        } catch (error) {
            console.error("Error in getLockStatus:", error);
            throw error;
        }
    },

    updateLockStatus: async (button, isLocked) => {
        try {
            const lock = await Lock.findOneAndUpdate(
                { button },
                { isLocked },
                { new: true, upsert: true }
            );
            return lock;
        } catch (error) {
            console.error("Error in updateLockStatus:", error);
            throw error;
        }
    }
};

module.exports = lockService;