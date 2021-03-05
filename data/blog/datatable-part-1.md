---
title: Building a data-table
date: '2016-03-08'
tags: ['markdown', 'code', 'features']
draft: false
summary: Example of a markdown file with code blocks and syntax highlighting
---

## Introduction

In this series, we will go through the process of building a data-table with VueJS & Laravel. We will be covering a wide range of topics such as performing CRUD operations, searching, sorting and advanced filtering to give you a good base to build upon, improve and modify to meet the requirements of your application.

Before we start we need to address that creating a data table requires careful planning and consideration. Depending on what kind of application you are building, you need to determine if records should be created or updated inline or in a pop-up modal? Should records be grouped or not grouped? Do you need flexible column sizing?

As you can see, data tables come with a set of challenges. From a design perspective, we need the data table to be easy to use, responsive, readable, have the right colouring, and accessible.

From a functionality perspective, we need to be able to create, read, update and delete data. With all of this data, we need to paginate, search, sort and apply complex filtering options.

However, we will not be covering testing since it's a huge topic in itself and that's not what this book is about.

## Tech Stack

This data-table series is written with Laravel and VueJS developers in mind using Tailwindcss for styling and Vuex for our frontend state management. A basic understanding of PHP, Laravel, VueJS and Vuex is essential. An understanding of Tailwind would be beneficial, hwoever not essential.

As a starting point, clone the GitHub repository, as this series does not focus on styling our data-table, and to reduce clutter, we have included the HTML markup and styling for our data table and related components.

## API Endpoints

In our repository starter, we have defined the following API routes to get, create, update and delete resources.

In our `routes/api.php` file we have the following API routes.

| Method |          URI           |                              Description |
| :----- | :--------------------: | ---------------------------------------: |
| GET    |    /api/tranactions    |          List all available transactions |
| POST   |   /api/transactions    |        Create a new transaction resource |
| PATCH  | /api/transactions/{id} | Update a particular transaction resource |
| DELETE | /api/transactions/{id} | Delete a particular transaction resource |

## Setup

To get started, clone the following repository. In here, you will find a few things already set up for you, such as our transaction `migration, model, controller, factory and resource` files. And if you take a look in the `js` folder, you will find a few components markup as well as our `vuex` store and our main data-table component.

`git clone xxxx`

Note: Make sure you have created your database, and updated your `.env` file and migrated the latest changes.

Once you're all setup, let's start off by creating some dummy data using our `Transaction` factory to create 20 records.

`Transaction::factory()->count(20)->create()`

Now that we have a list of transactions we can think about how we are going to fetch this data from our client slide.

Let's head over to our `index` method in our `TransactionController` file where we will return our list of transactions when the method is called.
