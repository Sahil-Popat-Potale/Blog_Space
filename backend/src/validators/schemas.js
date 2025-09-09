import Joi from 'joi';

// Register schema
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$'))
    .required(),
});

// Login schema
export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

// Post schema
export const postSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .required(),
  content: Joi.string()
    .min(50)
    .required(),
  categories: Joi.array()
    .items(Joi.number().integer())
    .optional(),
  is_approved: Joi.boolean().optional(),
});

// Comment schema
export const commentSchema = Joi.object({
  post_id: Joi.number()
    .integer()
    .required(),
  content: Joi.string()
    .min(1)
    .required(),
  parent_comment_id: Joi.number()
    .integer()
    .allow(null),
});
