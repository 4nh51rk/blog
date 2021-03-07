---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 5
date: '2021-03-08'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this series, we will go through the process of building a data-table with VueJS & Laravel. We will be covering a wide range of topics such as performing CRUD operations, searching, sorting and advanced filtering to give you a good base to build upon, improve and modify to meet the requirements of your application.
---

In this section, we will be covering bulk deletion of our records with select checkboxes on the left hand side of each row in our data-table. Once we have all our records selected, an array of record IDs will be passed through to our API and then deleted.


Lets start off by creating a new selected array in our new data property, and specify this new property using `v-model` to dynamically update our property, passing through the `transaction` ID as the value.

```javascript{3}
  data: () => ({
    //...
    selected: [],
  }),
```

```html{3}
<!-- -->
    <td class="border-dashed border-t border-gray-200 px-3">
        <label
        class="text-teal-500 inline-flex justify-between items-center hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
        >
        <input
            v-model="selected"
            :value="transaction.id"
            type="checkbox"
            class="form-checkbox rowCheckbox focus:outline-none focus:shadow-outline"
        />
        </label>
```

Now, whenever a checkbox has been checked, our `selected` array will update and store each id in array which will look something like this:
`[34, 56, 44, 33, 22, 11]`

We also need to have a checkbox in our table header for selected all checkboxes available on the screen. We can achieve this by creating a new click event on our `thead` `input` element and calling a new method `selectAllCheckboxes`.

```html{5}
<thead>
    <tr class="text-left h-6">
        <th
        class="w-8 py-2 px-3 sticky top-0 border-b border-gray-200 bg-gray-100"
        >
        <label
            class="text-teal-500 inline-flex justify-between items-center hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
        >
            <input
            @click="selectAllCheckboxes"
            type="checkbox"
            class="form-checkbox focus:outline-none focus:shadow-outline"
            />
        </label>
        </th>
<!-- -->
```

The way that we want this method to function is by checking to see if our selected array already contains transaction ids, if it does, set it back to an empty object and return nothing.

Otherwise, if our array is not empty, we then iterate over our `transactions`, and return each `transaction` id, passing the id to our `selected` array.
```javascript
    selectAllCheckboxes() {
      if(this.selected.length > 0) {
        this.selected = [];
        return;
      }
      this.selected = this.transactionList.map(transaction => transaction.id)
    },
```

Let's now create a new API method called `destroy` in our `TransactionController`, passing through our `transactions` as a JSON stringified array as a parameter.

`TransactionController.php`

```php{1-3}
    public function destroy($transactions)
    {
        Transaction::whereIn('id', explode(',', $transactions))->delete();
    }
```

Using the `whereIn` database query method, we can specify the table column as the first parameter, followed by a list of arrays. This method will return all `Transactions` in our database with a matching id value.

Because we have a stringified JSON array, we can use the `explode` php function to split this array by each comma and chain on a `delete` function deleting all records by the list of id's given.


Now, in our `vuex` store, we can create a new `deleteTransactions` store which accepts a list of transactions and passes that list to our API endpoint.

```javascript{3-5}
export const actions = {
    //...
    async deleteTransactions({ commit }, { transactions }) {
        return await axios.delete(`/api/transactions/${transactions}`)
    },
}
```


Back in our data table component, we can register our `deleteTransactions` method in our `vuex` store and pass through the selected id's through as our data.

Once the data has been deleted, we can re-fetch our new data and set `selected` back to an empty array.


Let's create this new method
```javascript
methods: {
    //...
    async deleteRecords() {
        await this.deleteTransactions({
            transactions: this.selected
        });

        await this.fetchTransactions()

        this.selected = [];
},
...
```