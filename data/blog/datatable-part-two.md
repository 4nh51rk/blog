---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 2
date: '2021-03-02'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this section, we will be covering how to implement quick search functionality based on a users search query, as well as implementing record limiting to display a certain amount of records into our data table.
---

In this section, we will be covering how to implement quick search functionality based on a users search query, as well as implementing record limiting to display a certain amount of records into our data table.

Since we have three different data types in our table to sort by, we will need to sort a column either by a string, number or a date value in ascending or descending order. I have decided to make all columns sortable, but you may wish to make only some of the columns sortable.

First off, we will need to change our `v-for` loop to loop over a computed property `transactionList` which will allow us to react to any changes made.

```html{4}:resources/js/DataTable.vue
<!-- -->
<tbody>
    <template>
      <tr
          v-for="transaction in transactionList"
          :key="transaction.id"
          class="max-h-2 hover:bg-gray-50 cursor-pointer"
          >
<!-- -->
```

In our computed property, we will need to bring our `mapGetters` function into here and now define out `transactionList` method underneath.

```javascript{6-11}:resources/js/DataTable.vue
  computed: {
    ...mapGetters({
      transactions: "transactions/transactions",
    }),

    transactionList: function transactions() {
      if (this.transactions.data) {
      } else {
        return [];
      }
    },
  },
```

All we're currently doing in our `transactionList` method currently is checking if we have our transactions array, otherwise returning a blank array.

Next, in our data object we can now define a new sort property, which will contain column and a direction to sort by. Our default table sorting will sort our transactions by date in a descending order (newest to oldest)

```javascript{3-6}:resources/js/DataTable.vue
data: () => {
    //...
    sort: {
        column: "date",
        direction: "desc",
	},
    //...
}

```

In our table heading, we can now create a click event, which sorts a column by either ascending or descending order by calling a method `sortColumn` and passing in a column name

```html{9}:resources/js/DataTable.vue
<table class="border-collapse w-full whitespace-no-wrap bg-white">
  <thead>
    <tr class="text-left h-6">
      <th class="w-8 py-2 px-3 sticky top-0 border-b border-gray-200 bg-gray-100">
        <label
          class="text-teal-500 inline-flex justify-between items-center hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
        >
          <input
            type="checkbox"
            class="form-checkbox focus:outline-none focus:shadow-outline"
            @change="selectAllCheckboxes"
          />
        </label>
      </th>
      <th
        v-for="(column, index) in columns"
        :key="index"
        class="w-40 bg-gray-100 sticky top-0 border-solid border border-gray-200 cursor-pointer px-6 py-3 text-gray-600 font-bold tracking-wider uppercase text-xs"
        @click="sortColumn(column)"
      ></th>
    </tr>
  </thead>
</table>
```

For a nice visual effect, we can add up/down svg arrows depending on if a direction is selected for that column, otherwise, no arrow will be displayed.

```html{6,13,19}:resources/js/DataTable.vue
<th v-for="(column, index) in columns" :key="index"
    class="w-40 bg-gray-100 sticky top-0 border-solid border border-gray-200 cursor-pointer px-6 py-3 text-gray-600 font-bold tracking-wider uppercase text-xs"
    @click="sortColumn(column)">
    <template v-if="sort.column === column">
        <div class="flex items-center" v-if="sort.direction === 'asc'">
            <span class="mr-2">{{ column }}</span>
            <span>
                <icon name="arrow-down" />
            </span>
        </div>
        <div class="flex items-center" v-if="sort.direction === 'desc'">
            <span class="mr-2">{{ column }}</span>
            <span>
                <span>
                    <icon name="arrow-up" />
                </span>
            </span>
        </div>
    </template>

    <template v-else><span>{{ column }}</span></template>
</th>
<th
    class="w-4 bg-gray-100 sticky top-0 border-solid border border-gray-200 px-6 py-3 text-gray-600 font-bold tracking-wider uppercase text-xs">
</th>
```

Now we can define our `sortColumn` method and set both the column and direction depending on the direction already set in our data property.

```javascript{3-6}:resources/js/DataTable.vue
methods: {
    ///...
    sortColumn(column) {
        this.sort.column = column;
        this.sort.direction = this.sort.direction === "asc" ? "desc" : "asc";
    },
    //...
}
```

Back to our computed `transactionList` method, we will need to create a new method called `sortArray` passing through a shallow copy of our transactions array using slice because `Array.prototype.sort` function alters the original array instead of returning a new sorted copy, as well as our column and direction to sort data by.

```javascript{4-11}:resources/js/DataTable.vue
  computed: {
    transactionList: function transactions() {
      if (this.transactions.data) {
        const column = this.sort.column;
        const direction = this.sort.direction;

        return this.sortArray(
          this.transactions.data.slice(), // ...this.transactions.data ??
          column,
          direction
        );
      } else {
        return [];
      }
    },
  },
```

Our new `sortArray` method will need to be able to sort by an amount, date and text fields and sort the data either in ascending or descending order.

To start off with, let's create this new method, and start off by checking if the column that was passed through is equal to `amount`,if so, we will sort our array of transactions using the `sort` method.

The sort method is a comparison function, that takes in two arguments (typically a, b) and returns `1` if the first element precedes the second, `-1` if the second element precedes the first. If the two are both equal, the function returns `0` to preserve the order.

Depending on if the direction is `asc` or `desc` both the comparison arguments from our `sort` function can be reversed to sort in the opposite order.

```javascript{3-11}:resources/js/DataTable.vue
methods: {
    //...
    sortArray(array, column, direction) {
        if (column === "amount") {
            return array.sort((a, b) => {
                return direction === "asc"
                    ? a[column] - b[column]
                	  : b[column] - a[column];
            });
        }
    },
    //...
}
```

We can also handle sorting in the exact same way if the column passed through was a date or just a string.

If the column passed through was a date, we need to convert our date string to a date object and perform the same sort function as before.

If the column passed was neither a date or a number, we can use a built in javascript function `localCompare` which compares two strings with another to check if the current string is lower, equal or greater than the string passed thorugh in the `localCompare` function.

```javascript{12-24}:resources/js/DataTable.vue
methods: {
    // ...
    sortArray(array, column, direction) {
        if (column === "amount") {
            return array.sort((a, b) => {
                console.log("type ", typeof a[column]);
                return direction === "asc"
                    ? a[column] - b[column]
                	  : b[column] - a[column];
            });
        }
        else if(column === 'date') {
            return array.sort((a, b) => {
                return direction === 'asc'
                    ? new Date(a[column]) - new Date(b[column])
                	  : new Date(b[column]) - new Date(a[column])
            })
        } else {
            return array.sort((a, b) => {
                return direction === 'asc'
                    ? a[column].localeCompare(b[column])
                	  : b[column].localeCompare(a[column])
            })
        }
    },
    // ...
}
```
