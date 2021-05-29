---
title: Supabase Relationships
date: '2021-05-29'
tags: ['supabase', 'relationships', 'one-to-one', 'one-to-many', 'many-to-many']
draft: false
summary: Let's review creating one-to-one, one-to-many and many-to-many relationships with Supabase.
---

# Defining Relationships
Database tables are often relted to one another, usually by using one-to-one, one-to-many or many-to-many relationship.

Before we dive in, here is a quick example on how we can create a foreign relationship inside the GUI.
![foreign-relationship](https://user-images.githubusercontent.com/39175284/120087385-94e1f680-c13b-11eb-9cc8-b0c4b4a28e5a.gif)

## One To One
A one-to-one relationship is an easy relationship to picture in your head. What is one record associated with? In the following example, a `User` is associated with one `Vehicle`. We can summarize our relationships like so:

```
  users
    id - int8
    name - text
    car_id - int8

  vehicles
    id - int8
    make - text
    model - text
```

The `car_id` in the `users` table is creating a foreign relationship back to the `cars` table referencing a cars `id`.

We can now write a query to fetch the `id` and `name` columns from the `users` table, as well as the `make` and `model` from a car referenced to a user.

```javascript
  const fetchUsers = async () => {
    let { data, error } = await supabase
      .from("users")
      .select(`
        id, name,
        cars (make, model)
      `)

    setUsers(data)
    console.log(users);
    if (error) console.log("error", error);
  };
```

The above relationship can also be inversed, by setting a `user_id` on the `cars` table.

## One To Many

A one-to-many relationship is used to define relationships where a single record is parent to one or more child records. In this example, we will use the concept of posts and comments, where a post can have many comments. We can summarize this relationship like so:

```
  posts
    id - int8
    content - text

  comments
    id - int8
    post_id - int8
    content - text
```

Just like a one-to-one relationship, we are creating a foreign relationship `post_id` in the `comments` table, however, many comments can have a posts `id`.

We can now write a query to fetch all posts and comments related to the post.

```javascript
  const fetchPosts = async () => {
    let { data, error } = await supabase
      .from("posts")
      .select(`
        id, content,
        comments (id, content)
      `)
    console.log(data)
    if (error) console.log("error", error);
  };
```

## Many To Many

A many-to-many relationship is where more than one record in one table is related to more than one in another. We can illustrate this by using posts and tags. A post can have many tags, while tags can have many posts.

To define a many to many relationship, we need to define three database tables: `posts`, `tags` and `post_tag`. The `post_tag` table is generally called a pivot table, and has a general naming convention of being in alphabetical order, underscore seperated and singular wording.

This `post_tag` should contain two columns `post_id` and `tag_id`. We can summarize the relationship structure like so:

```
  posts
    id - int8
    content - text

  tags
    id - int8
    name - text

  post_tag
   post_id - int8
   tag_id - int8
```

**Note:** `post_id` and `tag_id` columns in the `post_tag` table should both have a foreign relationship back to the respective tables.

Now we can populate our `post_tag` referencing a `post_id` and a `tag_id` which could look something like this:

`post_tag`
| id  | post_id | tag_id |
| ----|:-------:| ------:|
|  1  |    1    |   1    |
|  2  |    1    |   2    |
|  3  |    1    |   3    |

We can now write a query to fetch our `posts` containing an array of tags.

```javascript
  const fetchPosts = async () => {
    let { data, error } = await supabase
      .from("posts")
      .select(`
          id, content,
          tags (id, name)
      `)
    console.log(data)
    if (error) console.log("error", error);
  };
```

Again, the above query can be inversed to fetch all `tags` and `posts` related to each tag.
