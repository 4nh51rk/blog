---
title: Supabase Relationships
date: '2021-03-02'
tags: ['supabase', 'relationships', 'one-to-many', 'many-to-many']
draft: false
summary:
---

# Defining Relationships

## One To One
A one-to-one relationship is a very basic type of database relationship. In the following example, a `User` is associated with one `Vehicle`. To keep things simple, let's say we have just a `name` column on our `Users` table, and `make` and `model` columns on our `Vehicles` table.

To assign a car to a user, we can have a new column on the `Users` table called `car_id` specifying a `Car` id into here. This allows us to access a user, and their car in one query.

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
In the above query, we are fetching the `id` and `name` from the `Users` table as well as `make` and `model` from the `Cars` table.

This can also defined as a inverse relationship by setting a `user_id` on the `Cars` table.

## Many To Many

A post can have many tags, and a tag can have many posts. Again, to keep our tables simple, our `Posts` table will only contain a `content` column and our `Tags` table will contain a `name` column.

To define a many to many relationship, we need to define three database tables: `posts`, `tags` and `post_tag`. The general naming convention of the `post_tag` linking/pivot table is to take the two table names and put them in alphabetical order, underscore seperated and singular.

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

**Note:** When creating columns in our `post_tag` pivot table, you must add a foreign key referncing this column to a table.

Now we can populate our `post_tag` referencing a `post_id` and a `tag_id`.

`post_tag`
| id  | post_id | tag_id |
| ----|:-------:| ------:|
|  1  |    1    |   1    |
|  2  |    1    |   2    |
|  3  |    1    |   3    |

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
In the query above, we're selecting `Posts` `id` and `conent` columns and fetching all `Tags` related to that post. The above query can also be inversed, so we fetch all `tags` and all `posts` related to a tag.
