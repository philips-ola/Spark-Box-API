import express from 'express'
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


// @Route           GET /api/ideas
// @Decsription     Get all ideas
// @Access          Public
// @Query           _limit (Optional limit for ideas returned)
router.get('/', async(req, res, next) => {
   const limit = parseInt(req.query._limit);
   const query = Idea.find().sort({createdAt: -1});

   if(!isNaN(limit)){
      query.limit(limit);
   }

   try {
    const ideas = await query.exec();
    res.json({
      Total: ideas.length,
      ideas
   });
 }catch(err) {
    console.log(err)
    next(err)
 }
});


// @Route           GET /api/ideas/:id
// @Decsription     Get single idea
// @Access          Public
router.get('/:id', async(req, res, next) => {

 try {

      // Check if Id is valid or throw error
   const {id} = req.params;
   if(!mongoose.Types.ObjectId.isValid(id)){
      res.status(404);
      throw new Error('Idea not found')
   };

    const idea = await Idea.findById(id);
    if(!idea){
      res.status(404)
      throw new Error('Idea not found')
    }
    res.json(idea);

 }catch(err) {
    console.log(err)
    next(err)
 }
});

// @Route           POST /api/ideas
// @Decsription     Create new Idea
// @Access          Public
router.post('/', protect, async (req, res, next) => {
   try {
      const {title, summary, description, tags} = req.body || {};
      if(!title?.trim() || !summary?.trim() || !description?.trim()){
         res.status(400);
         throw new Error("title, summary, and description fields are required")
      }

      // Check if title already exists in the database
      const titleExists = await Idea.findOne({title: title})
      if(titleExists){
         res.status(400);
         throw new Error('Title already exists')
      }

      // Create an instance of an Idea
      const newIdea = new Idea({
         title,
         summary,
         description,
         tags: typeof tags === 'string'
            ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
            : Array.isArray(tags)
               ? tags.map((tag) => String(tag).trim()).filter(Boolean)
               : [],
         user: req.user?._id || req.user?.id
      });

      // Save the Idea
      const savedIdea = await newIdea.save();
      res.status(201).json(savedIdea);
   } catch (err) {
      next(err)
   }
});


// @Route           DELETE /api/ideas/:id
// @Decsription     Delete single idea
// @Access          Public
router.delete('/:id', protect, async(req, res, next) => {

 try {

      // Check if Id is valid or throw error
   const {id} = req.params;
   if(!mongoose.Types.ObjectId.isValid(id)){
      res.status(404);
      throw new Error('Idea not found')
   };

    const idea = await Idea.findById(id);
   if(!idea) {
      res.status(404);
      throw new Error('Idea not found')
   }

   // Check if user owns Idea
   if(idea.user.toString() !== req.user._id.toString()){
      res.status(403);
      throw new Error('Not authorized to delete this Idea');
   }

   await idea.deleteOne();

    res.json({"Message": 'Idea deleted successfully'});

 }catch(err) {
    console.log(err)
    next(err)
 }
});


// @Route           PUT /api/ideas/:id
// @Decsription     Update single idea
// @Access          protected
router.patch('/:id', protect, async(req, res, next) => {
   try{
      const {id} = req.params;
      // Check if it is a valid ID
      if(!mongoose.Types.ObjectId.isValid(id)){
      res.status(404);
      throw new Error('Idea not found');
   }

   const idea = await Idea.findById(id);

   if(!idea) {
      res.status(404);
      throw new Error('Idea not found')
   }

 // Check if user owns Idea
   if(idea.user.toString() !== req.user._id.toString()){
      res.status(403);
      throw new Error('Not authorized to update this Idea');
   }

      // Check if some fields are empty
      const {title, summary, description, tags} = req.body || {};
      if(!title?.trim() || !summary?.trim() || !description?.trim()){
      res.status(400);
      throw new Error("title, summary, and description fields are required")
      }

      idea.title = title;
      idea.summary = summary;
      idea.description = description;
      idea.tags = typeof tags === 'string'
         ? tags.split(',').map((t) => t.trim()).filter(Boolean)
         : Array.isArray(tags)
            ? tags.map((t) => String(t).trim()).filter(Boolean)
            : idea.tags;
      
      const updatedIdea = await idea.save();
      res.json({
         message: 'Updated successfully',
         updatedIdea
      })
   }catch(err){
      console.log(err);
      next(err);
   }
})


export default router;