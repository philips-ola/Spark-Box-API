import express from 'express'
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';

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
    res.json(ideas);
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
// @Decsription     Create new IDea
// @Access          Public
router.post('/', async (req, res) =>{
    const {title, summary, description, tags} = req.body;
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
      tags:typeof tags === 'string' ? tags.split(',')
      .map((tag) => tag.trim()).filter(Boolean) : Array.isArray(tags) ? tags : []
   });

   // Save the Idea
   const savedIdea = await newIdea.save();
   res.status(201).json(savedIdea);
});


// @Route           DELETE /api/ideas/:id
// @Decsription     Delete single idea
// @Access          Public
router.delete('/:id', async(req, res, next) => {

 try {

      // Check if Id is valid or throw error
   const {id} = req.params;
   if(!mongoose.Types.ObjectId.isValid(id)){
      res.status(404);
      throw new Error('Idea not found')
   };

    const idea = await Idea.findByIdAndDelete(id);
    if(!idea){
      res.status(404)
      throw new Error('Idea not found')
    }
    res.json({"Message": 'Idea deleted successfully'});

 }catch(err) {
    console.log(err)
    next(err)
 }
});


// @Route           PUT /api/ideas/:id
// @Decsription     Update single idea
// @Access          Public
router.patch('/:id', async(req, res, next) => {
   try{
      const {id} = req.params;
      // Check if it is a valid ID
      if(!mongoose.Types.ObjectId.isValid(id)){
      res.status(404);
      throw new Error('Idea not found');
   }

      // Check if some fields are empty
      const {title, summary, description, tags} = req.body;
      if(!title?.trim() || !summary?.trim() || !description?.trim()){
      res.status(400);
      throw new Error("title, summary, and description fields are required")
      }

      const updatedIDea = await Idea.findByIdAndUpdate(id,{
         title, 
         summary, 
         description,
         tags: tags? (Array.isArray(tags) ? tags : tags.split(',').map((t) =>t.trim())): []
      }, {new: true, runValidators: true})

      if(!updatedIDea){
         res.status(404);
         throw new Error('Idea not found')
      }

      res.json({
         message: 'Updated successfully',
         updatedIDea
      })
   }catch(err){
      console.log(err);
      next(err);
   }
})


export default router;