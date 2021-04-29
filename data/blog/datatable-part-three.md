---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 3
date: '2021-03-04'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this section, we will be covering implementing quick search functionality to search all columns in our data-table to display all relevant results, based on a users search query. Along with building this, we'll also add in record limiting to display a certain number of records.
---

## Introduction

In this section, we will be covering implementing quick search functionality to search all relevant columns in our data-table to display all relevant results, based on a users search query. Along with building this, we'll also add in record limiting to display a certain number of records.

We will be handling both record searching and limiting on the server-side. This is because pagination will be handled on our server and for each search or limit that we perform, we also need to re-paginate the results we get back from our database.

To keep our application as performant as possible, when we perform a search on the client side we need to set a slight debounce that will prevent an API call from being made to the server each time the user presses a key. We also will need to set a record limit count as we don't want to display all records in one batch, we want to only display a small number of records and fetch more from our API and render them to the page when the user requests more. This is typically either achieved by using an infinite scroll method or paginating records into separate pages.
In this example, we will be covering the latter as it's more commonly used offers a cleaner user experience.

## Quick Search

Let's start off by creating a new `Search.vue` component, creating a new search input field and setting the model binding to a data property `value`.

```html{1-19}
<template>
  <div class="relative md:w-1/3">
    <input
      type="search"
      v-model="value"
      class="w-full pl-10 pr-4 py-2 rounded-lg shadow focus:outline-none focus:shadow-outline text-gray-600 font-medium"
      placeholder="Search..."
    />
    <div class="absolute top-0 left-0 inline-flex items-center p-2">
      <icon name="search" />
    </div>
  </div>
</template>
<script>
import Icon from "./Icon";
export default {
  components: {
      Icon
  },

  data: () => ({
    value: ''
  }),
};
</script>

```

```javascript{3}
data: () => ({
    //...
    searchQuery: "",
}),
```

And pull in our new `Search` component into our main `DataTable` component.

```html{6}
<!-- -->
        <span class="ml-2">Create Transaction</span>
      </button>
    </div>
    <div class="flex items-center mt-4">
      <div class="flex flex-1 items-center pr-4">
        <search v-on:search-change="applySearch" />
        <!-- -->
```

Above, we are defining a new method `applySearch` which will be triggered in our `Search` component and call this new method in our Datatable.

```javascript{6-10}
transactionList: function transactions() {
methods: {
    // ...
    async applySearch(search) {
      this.searchQuery = search;
      await this.fetchTransactions();
    },
}
}
```
Above, we are updating our search query value (which we will create in a moment) in our data table and calling our `fetchTransactions` method that we defined earlier.
```javascript{3}
  data: () => ({
    // ...
    searchQuery: "",
  });
```
Now in our dispatch method inside `fetchTransactions`, we need to pass through this search value to our store.
```javascript{5-6}
  methods: {
    // ...
    async fetchTransactions() {
      const search = this.searchQuery
      await this.$store.dispatch("transactions/fetchTransactions", {
        search,
      });
      this.loading = false;
    },
```

In our store, we can destructure the `props` passed through and grab the search query and append value to URL as a query string.

```javascript{}
export const actions = {
    async fetchTransactions({ commit }, { search }) {
        try {
            const { data } = await axios.get(`/api/transactions?search=${search}`)

            commit(types.FETCH_TRANSACTIONS, { transactions: data })
        } catch (e) {
            console.log("ERROR", e)
        }
    },
    // ...
}
```

Inside of our `Transactions` class model, we will define a new scope which will handle filtering data rows from our database and returning the results back to the user.

```php{}
    public function scopeSearch($query, string $terms = null)
    {
        collect(explode(' ', $terms))->filter()->each(function ($term) use ($query) {
            $term = '%' . $term . '%'; // Wildcard symboil for partiall matching

            $query->where('category', 'like', $term)
                ->orWhere('payee', 'like', $term)
                ->orWhere('amount', 'like', $term)
                ->orWhere('notes', 'like', $term)
                ->orWhere('account', 'like', $term);
        });
    }
```

Inside of this new scope, we have access to the `query` builder as well as search terms that we will pass through shortly.

To start off, we will turn the search term into a collection, and split the search term by a space and filter through each collection item.

To query our database, we will will make use of chaining on `orWhere` clauses to peform a lookup in our database on a number of columns, returning all relevant results based on our query.

Now, back in our `TransactionsController` class, we can bring in the `Request` helper, and get the `search` query paramater passed through to our API, saving this result to a variable and calling our new `Search` scope we just created passing in the search value.

```php{5}
class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $searchQuery = $request->search;

        return TransactionResource::collection(Transaction::latest()->search($searchQuery)->paginate(25))->response();
    }
```


## Record Limiting

Lets now move onto record limiting. As mentioned earlier, we want to keep this number relatively low to prevent performance issues with rendering and computing data. In this example, we will have a default limit of 25. With further options being 50, 75 and 100.

```javascript{3}
data: () => ({
    //...
    limit: 25,
    //...
}),

```

Once we have created our new data property and setting our `limit`, we can specify options in our drop down menu for additional limiting options.

```html{3-7}
<!-- -->
        <div class="relative ml-4">
          <select
            v-model="limit"
            @change="fetchTransactions"
            class="appearance-none h-full rounded border block appearance-none w-full bg-white text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white"
          >
            <option>25</option>
            <option>50</option>
            <option>75</option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          >
```

Also, notice we have a `change` method and `v-model` binding in our select drop down which will update our `limit` data property and then call our `fetchTransactions` method.

When this method is called, we pass through our `limit` data property as dispatch this action to our `vuex` store method.

```javascript{3-6}
methods: {
    async fetchTransactions() {
        const limit = this.limit;
        await this.$store.dispatch("transactions/fetchTransactions", {
            limit,
        });
        this.loading = false;
    },
//...
```

In our `fetchTransactions` method in our store we can destructure the `limit` property from out data passed through and send `limit` through as a query string.

`store/modules/transactions.js`

```javascript{2,4}
export const actions = {
    async fetchTransactions({ commit }, { limit }) {
        try {
            const { data } = await axios.get(`/api/transactions?limit=${limit}`)

            commit(types.FETCH_TRANSACTIONS, { transactions: data })
        } catch (e) {
            console.log("ERROR", e)
        }
    },
//...
```

In our `index ` controller method, we can bring in the `Request` class to interact with our HTTP request, and create a variable called `pageLimit` and set the value of the request `limit` query string to that variable, which can now be passed through to our `paginate` method.

```php{1,3-4}
    public function index(Request $request)
    {
        $pageLimit = $request->limit;
        return TransactionResource::collection(Transaction::latest()->paginate($pageLimit))->response();
    }
```
