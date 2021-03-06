---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 3
date: '2021-03-01'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this series, we will go through the process of building a data-table with VueJS & Laravel. We will be covering a wide range of topics such as performing CRUD operations, searching, sorting and advanced filtering to give you a good base to build upon, improve and modify to meet the requirements of your application.
---

In this section, we will be covering how to implement searching functionality into our data table displaying relevant results to the user based on their search query. We will only be focusing on implementing client-side search querying and filtering data available in our state but you may choose to perform this action on the server depending on if you have a large number of records filter through.

Let's start off by adding a new `searchQuery` data property and update this property by attaching a `v-model` binding to our search input field to update this property whenever the user types into this field.

```vue
...
<input
       v-model="searchQuery"
       type="search"
...
```

```javascript
data: () => ({
    //...
    searchQuery: "",
}),
```

Because we need to handle re-rendering our data, we will be performing our search operation in a computed property.

In our `transactionList` computed property, add a new condition to check if our `searchQuery` data property exists. If this is the case, we can perform a filter through our `transactions` records.

```javascript
transactionList: function transactions() {
    //...
    if (this.searchQuery) {
        return this.transactions.data.filter((transaction) => {
            return Object.keys(transaction).some((key) => {
                //
            });
        });
    }
    //...
}
```

How we are going to filter through our transactions is we need to first filter through our records and because we need to match our search query based on any columns values and then check if that value is a match by using `some` which returns either a true or a false value.

```javascript
transactionList: function transactions() {
    ...
    if (this.searchQuery) {
        return this.transactions.data.filter((transaction) => {
            return Object.values(transaction).some((value) => {
                return (
                    String(value)
                    .toLowerCase()
                    .includes(this.searchQuery)
                );
            });
        });
    }
    ...
}
```

Inside our `some` function, we first turn each value into a lowercase string and return true or false depending on if there is a matching value with our `searchQuery`.

Now, if any records that contain a column value with our `searchQuery` value will be filtered through and only display relevant records.


In this section, we will cover record limiting and pagination in our data table. To keep our application as performant as possible, we don't want to display all records in one batch, we want to only display a small number of records and fetch more from our API and render them to the page when the user requests more. This is typically either achieved by using an infinite scroll method or paginating records into separate pages.

In this book, we will be covering the latter as it's more commonly used offers a cleaner user experience.

We'll start with record limiting. As mentioned earlier, we want to keep this number relatively low to prevent performance issues with rendering and computing data. In this example, we will have a default limit of 25. With further options being 50, 75 and 100.

```javascript
data: () => ({
    ...
    limit: 25,
    ...
}),

```

Once we have created our new data property and setting our `limit`, we can specify options in our drop down menu for additional limiting options.

```vue
​```
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
​```
```

Also, notice we have a `change` method and `v-model` binding in our select drop down which will update our `limit` data property and then call our `fetchTransactions` method.

When this method is called, we pass through our `limit` data property as dispatch this action to our `vuex` store method.

```javascript
methods: {
    async fetchTransactions() {
        const limit = this.limit;
        await this.$store.dispatch("transactions/fetchTransactions", {
            limit,
        });
        this.loading = false;
    },
...
```

In our `fetchTransactions` method in our store we can destructure the `limit` property from out data passed through and send `limit` through as a query string.

`store/modules/transactions.js`

```javascript
export const actions = {
    async fetchTransactions({ commit }, { limit }) {
        try {
            const { data } = await axios.get(`/api/transactions?limit=${limit}`)

            commit(types.FETCH_TRANSACTIONS, { transactions: data })
        } catch (e) {
            console.log("ERROR", e)
        }
    },
...
```

In our `index ` controller method, we can bring in the `Request` class to interact with our HTTP request, and create a variable called `pageLimit` and set the value of the request `limit` query string to that variable, which can now be passed through to our `paginate` method.

```php
​```
    public function index(Request $request)
    {
        $pageLimit = $request->limit;
        return TransactionResource::collection(Transaction::latest()->paginate($pageLimit))->response();
    }
​```
```

