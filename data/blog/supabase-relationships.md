---
title: Supabase Relationships
date: '2021-03-02'
tags: ['supabase', 'relationships', 'one-to-many', 'many-to-many']
draft: false
summary:
---

A one-to-one relationship is a very basic type of database relationship. In the following example, a `User` is associated with one `Vehicle`. To keep things simple, let's say we have just a `name` column on our `Users` table, and `make` and `model` columns on our `Vehicles` table.

To assign a car to a user, we can have a new column on the `User` table called `car_id` specifying a `cars` id into here. This allows us to access a user, and their car in one query.

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