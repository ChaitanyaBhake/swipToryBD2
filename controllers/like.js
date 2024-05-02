const Story = require('../models/storyModel');
const User = require('../models/userModel');

exports.likeStory = async (req, res) => {
    try {
        //Extract Data
        const storyId = req.params.id;
        const userId = req.body.userId;

        //Find story and user by respective IDs
        const story = await Story.findById(storyId);
        const user = await User.findById(userId);

        //Throw error if not available
        if (!story) {
            return res
                .status(404)
                .json({ success: false, message: 'Story not found' });
        }
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found' });
        }

        // User already liked the story?
        if (user.likes.includes(storyId)) {
            return res.status(400).json({
                message: 'You have already liked this story',
                liked: true,
                story: story,
            });
        }

        // Push the user id to the story likes array and save
        story.likes.push(userId);
        await story.save();

        //  Push the story id to the user likes array and save
        user.likes.push(storyId);
        await user.save();

        //Update the total likes
        story.totalLikes = story.likes.length;

        //Return response
        return res.json({
            message: 'Story liked successfully',
            totalLikes: story.totalLikes,
            story: story,
            liked: true,
            likes: story.likes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong while liking the story',
            error: error,
        });
    }
};
