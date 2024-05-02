const User = require('../models/userModel');
const Story = require('../models/storyModel');

exports.bookmarkStory = async (req, res) => {
    try {
        //Extract Data
        let storyId = req.params.id;
        const { userId } = req.body;

        //Find user and story from DB
        const user = await User.findById(userId);
        const story = await Story.findById(storyId);

        // User and Story Present?
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found' });
        }
        if (!story) {
            return res
                .status(404)
                .json({ success: false, message: 'Story not found' });
        }

        //Already Bookmarked by user?
        if (user.bookmarks.includes(storyId)) {
            return res.status(400).json({
                message: 'Story already bookmarked',
                bookmarked: true,
            });
        }

        // Add the story to the user bookmarks
        user.bookmarks.push(storyId);
        await user.save();

        // Add the user to the story bookmarks
        story.bookmarks.push(userId);
        await story.save();

        return res.status(200).json({
            success: true,
            message: 'Story bookmarked successfully',
            bookmarks: user.bookmarks,
            bookmarked: true,
            story,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong while bookmarking the story',
            error: error,
        });
    }
};

exports.getAllBookmarks = async (req, res) => {
    try {
        //Extract Data
        const { userId } = req.params;

        //Find user in DB
        const user = await User.findById(userId);

        //User Found?
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found' });
        }

        // Find stories bookmarked by the user and sort in descending order
        const bookmarks = await Story.find({
            _id: { $in: user.bookmarks },
        }).sort({
            createdAt: -1,
        });

        //Return Res
        return res.status(200).json({
            success: true,
            message: 'All Bookmarks fetched successfully',
            bookmarks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving bookmarks',
            error,
        });
    }
};
