const Story = require('../models/storyModel');
const User = require('../models/userModel');
const errorHandler = require('../middlewares/errorHandler');

exports.createStory = async (req, res, next) => {
    try {
        //Extract Data
        const { slides, addedBy } = req.body;

        //Validation
        if (!slides || !addedBy) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Create a new story instance and save it in DB
        const story = new Story({ slides, addedBy });
        await story.save();

        // Respond with success status and the created story
        return res.status(201).json({
            success: true,
            message: 'Story Successfully Created',
            story,
        });
    } catch (error) {
        //Pass error to global handler
        next(new Error('Error creating story'));
    }
};

exports.getStories = async (req, res, next) => {
    //Define Categories
    const categories = ['Medical', 'Fruits', 'World', 'India'];

    //Extract Query Params
    const { userId, category, catLimit, cat } = req.query;

    //Define Pagination Parameters
    let page = parseInt(req.query.page) || 1;
    let limit = 4 * page;
    let skip = 0;

    try {
        let stories = [];

        //Retrieve stories by user ID and sort it in descending order
        if (userId) {
            stories = await Story.find({ addedBy: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        }

        // Retrieve all stories and group them by category
        else if (category && category.toLowerCase() === 'all') {
            // Group stories by category and apply pagination
            const groupedStories = {};

            // Iterate through each category in the 'categories' array
            for (let i = 0; i < categories.length; i++) {
                // Get the current category
                const c = categories[i];

                // Find stories that match the current category
                const categoryStories = await Story.find({
                    slides: { $elemMatch: { category: c } },
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(cat === c ? catLimit : 4);

                // Store the found stories in the 'groupedStories' object, using the category as the key
                groupedStories[c] = categoryStories;
            }

            return res.status(200).json({
                success: true,
                message: 'Retrieved Stories Successfully',
                stories: groupedStories,
                page,
            });
        }
        // Retrieve stories by specific category
        else {
            stories = await Story.find({
                slides: { $elemMatch: { category: category } },
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return res.status(200).json({
                success: true,
                message: 'Retrieved Story by the category successfully',
                stories,
                page,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fetched Stories Successfully',
            stories,
            page,
        });
    } catch (error) {
        //Pass error to global handler
        next(new Error('Error getting stories'));
    }
};

exports.getStoryById = async (req, res, next) => {
    try {
        //Extract data
        const { storyId } = req.params;
        const { userId } = req.query;

        //DB call to find story by its id
        const story = await Story.findById(storyId);

        //Validation
        if (!story) {
            return res
                .status(404)
                .json({ success: false, message: 'Story does not exists' });
        }

        //Calculate total likes of story
        let totalLikes = story.likes.length;

        //Check user id is provided or not
        if (userId) {
            //Db call to find Id
            const user = await User.findById(userId);

            if (user) {
                // check if user has liked/bookmarked the story
                const liked = user.likes.includes(storyId);
                const bookmarked = user.bookmarks.includes(storyId);

                return res.status(200).json({
                    success: true,
                    story,
                    liked: liked,
                    bookmarked: bookmarked,
                    totalLikes,
                });
            }
        } else {
            return res.status(200).json({ success: true, story, totalLikes });
        }
    } catch (error) {
        //Pass error to global handler
        next(new Error('Error getting story'));
    }
};

exports.updateStory = async (req, res, next) => {
    try {
        //Extract Data
        const { slides, addedBy } = req.body;

        //Validation
        if (!slides || !addedBy) {
            res.status(400).json('All fields are required');
        }

        //Find Story by its Id
        const story = await Story.findById(req.params.id);

        //Story exists?
        if (!story) {
            res.status(404).json({
                success: false,
                message: 'Story not found',
            });
        }
        // Update Story with new slides and and its owner and save it
        story.slides = slides;
        story.addedBy = addedBy;
        await story.save();

        return res.status(200).json({
            success: true,
            message: 'Story Updated Successfully',
            story,
        });
    } catch (error) {
        //Pass error to handler
        next(new Error('Error updating story'));
    }
};
