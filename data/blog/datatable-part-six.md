---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 6
date: '2021-03-09'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this series, we will go through the process of building a data-table with VueJS & Laravel. We will be covering a wide range of topics such as performing CRUD operations, searching, sorting and advanced filtering to give you a good base to build upon, improve and modify to meet the requirements of your application.
---

In this section, we will create an advanced filtering component where filters can be applied to any column in our table with the ability to add multiple filters to a single search using different filtering operators.

To start, create a new `AdvancedSearch.vue` component in your `/js/Components` directory and copy and paste the following markup.

```html
<template>
  <div
    class="fixed bottom-0 inset-x-0 pt-4 sm:inset-0 sm:flex sm:items-center sm:justify-center"
  >
    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
    <div
      class="bg-white rounded-lg pt-5 shadow-xl transform transition-all max-w-2xl"
    >
      <template>
        <div class="flex items-center px-6">
          <div class="relative mb-4">
            <label class="block">
              <label for="email" class="text-sm leading-7 text-gray-600"
                >Filter By</label
              >
              <select
                class="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-500 focus:bg-white focus:ring-0 focus:outline-none"
              >
                <option
                >

                </option>
              </select>
            </label>
          </div>
          <div
            class="relative mb-4 px-4"
          >
            <label class="block">
              <label for="operator" class="text-sm leading-7 text-gray-600"
                >Operator</label
              >
              <select
                class="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-500 focus:bg-white focus:ring-0 focus:outline-none"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="does not contain">Does Not Contain</option>
              </select>
            </label>
          </div>
          <div
            class="relative mb-4"
          >
            <label class="block">
              <label for="email" class="text-sm leading-7 text-gray-600"
                >Value</label
              >
              <input
                placeholder="Search..."
                id="value"
                type="text"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
              />
            </label>
          </div>
        </div>
      </template>
        <button
          class="flex items-center mx-2 px-2 py-2 bg-gray-200 text-gray-700 text-sm shadow-md rounded-lg mt-2 hover:bg-gray-300 hover:text-gray-900 rounded-full focus:outline-none cursor-pointer"
        >
          <svg
            class="w-6 h-6 text-green-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Filter
        </button>
      <div class="flex justify-end bg-gray-50 py-2 mt-5 px-4">
        <span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
          <button
            type="button"
            class="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5"
          >
            Cancel
          </button>
        </span>
        <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
          <button
            type="button"
            class="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-500 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5"
          >
            Apply Filters
          </button>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {

}
</script>
```

Now if we put our `AdvancedSearch` component at the bottom of our data table, we should now see a pop-up modal appear on our screen.

```html{3}
<!-- -->
	<div>
      <AdvancedSearch />
    </div>
  </div>
</template>
```

We can now add a new data property to set whether our filter modal should be open or closed and add a click event to our filter button to open modal.

```javascript{5}
//...
export default {
    data: () => ({
        //...
        openFilterModal: false,
    }),
    //...
```

 ```html{1}
<button
        type="button"
        @click="openFilterModal = true"
        class="flex items-center text-gray-700 px-3 py-1 border font-medium rounded focus:outline-none"
        >
    <svg
         viewBox="0 0 24 24"
         preserveAspectRatio="xMidYMid meet"
         class="w-5 h-5 mr-1"
         >
        <g class="">
            <path d="M0 0h24v24H0z" fill="none" class=""></path>
            <path
                  d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                  class=""
                  ></path>
        </g>
    </svg>
    Filter
</button>
 ```

Now we can dynamically show our `AdvancedSearch` component.

```html
<!-- -->
	<div v-if="openConfirmDeleteModal" >
      <AdvancedSearch />
    </div>
  </div>
</template>

<script>
```

Next up, let's pass through our table columns  and accept the props in our `AdvancedSearch` component.

```html
<!-- -->
	<div v-if="openConfirmDeleteModal" >
      <AdvancedSearch :columns="columns" />
    </div>
  </div>
</template>

<script>
```

`AdvancedSearch.vue`

```javascript
<script>
export default {
    props: ["columns"],
}
</script>
```

Now that we have our list of columns, let's loop through the list and set the drop down option value to each column name and uppercasing the first letter of each name.

```html
<select
        class="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-500 focus:bg-white focus:ring-0 focus:outline-none"
        >
    <option
            v-for="(column, index) in columns"
            :key="index"
            :value="column"
            >
        {{ column.charAt(0).toUpperCase() + column.slice(1) }}
    </option>
    ...
```

Because we want multiple search filters available, we will need to store each search filter in an array of objects. We can create this search property in our data object.

```javascript
export default {
  data: () => ({
    search: [
      {
        fromDate: "",
        toDate: "",
        column: "date",
        operator: "",
        value: "",
      },
    ],
  }),

  props: ["columns"],
}
```

In each of our search properties objects, we have both a `fromDate` and a `toDate` to specify a date range, along with a column in our database to filter results by, an operator property to check a certain condition as well as a value property to get records by that value.

To assign new objects to our `search` data property, we can create a new method called `createNewFilter` and push a new object to our `search` data property and call this method whenever a filter is added.

```javascript
export default {
    ...
    props: ["columns"],

    methods: {
        createNewFilter() {
            this.search.push({
                fromDate: "",
                toDate: "",
                column: "date",
                operator: "=",
                value: "",
            });
        },
    },
}
```

```html
<button
        class="flex items-center mx-2 px-2 py-2 bg-gray-200 text-gray-700 text-sm shadow-md rounded-lg mt-2 hover:bg-gray-300 hover:text-gray-900 rounded-full focus:outline-none cursor-pointer"
        @click="createNewFilter"
        >
    <svg
         class="w-6 h-6 text-green-800"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg"
         >
        <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
    </svg>
    Add Filter
</button>
```

For assigning model bindings, we will need to loop through our `search` array to get the array's length  and get the current search index.

```html
<template>
<div
     class="fixed bottom-0 inset-x-0 pt-4 sm:inset-0 sm:flex sm:items-center sm:justify-center"
     >
    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
    <div
         class="bg-white rounded-lg pt-5 shadow-xl transform transition-all max-w-2xl"
         >
        <template  v-for="(_, searchIndex) in search">
            <div :key="searchIndex" class="flex items-center px-6">
                <div class="relative mb-4">
                    <label class="block">
                        <label for="email" class="text-sm leading-7 text-gray-600"
                               >Filter By</label
                            >
      ...
```

Now, whenever a column in selected from our drop down menu, we can assign that column in our search data property by the specific index.

```html
<select
        v-model="search[searchIndex].column"
        class="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-500 focus:bg-white focus:ring-0 focus:outline-none"
        >
    <option
            v-for="(column, index) in columns"
            :key="index"
            :value="column"
            >
```

Since we don't need to display any operator values if the date column has been selected. If no date has been selected as the column, we can display our list of operators values and set the model binding to the selected operator value.

```html
<div
     v-if="search[searchIndex].column !== 'date'"
     class="relative mb-4 px-4"
     >
    <label class="block">
        <label for="operator" class="text-sm leading-7 text-gray-600"
               >Operator</label
            >
        <select
                v-model="search[searchIndex].operator"
                class="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-500 focus:bg-white focus:ring-0 focus:outline-none"
                >
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="does not contain">Does Not Contain</option>
            <option value="is not blank">Not Blank</option>
            <option value="is blank">Is Blank</option>
        </select>
    </label>
</div>
```

If the selected column is a date field, show a date picker component to specify a from date input field, and making sure we import the `datepicker` component,

```html
<div v-else class="relative mb-4 px-4">
    <label class="block">
        <label for="operator" class="text-sm leading-7 text-gray-600"
               >From</label
            >
        <div class="block w-full py-1 border-transparent rounded-lg">
            <date-picker
                         v-model="search[searchIndex].fromDate"
                         type="date"
                         format="DD/MM/YYYY"
                         ></date-picker>
        </div>
    </label>
</div>
```

```javascript
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
export default {
  data: () => ({
    //...
  }),
  components: {
    DatePicker,
  },
  // ...
```

Likewise, we can do the same as up above, and only show the `value` input field  if the date field has not been selected.

```html
<div
     v-if="search[searchIndex].column !== 'date'"
     class="relative mb-4"
     >
    <label class="block">
        <label for="email" class="text-sm leading-7 text-gray-600"
               >Value</label
            >
        <input
               v-model="search[searchIndex].value"
               placeholder="Search..."
               id="value"
               type="text"
               class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
               />
    </label>
</div>
<div v-else class="relative mb-4">
    <label class="block">
        <label for="operator" class="text-sm leading-7 text-gray-600"
               >To</label
            >
        <div class="block w-full py-1 border-transparent rounded-lg">
            <date-picker
                         v-model="search[searchIndex].toDate"
                         type="date"
                         format="DD/MM/YYYY"
                         ></date-picker>
        </div>
    </label>
</div>
```

Now that we are able to add new filters and model bindings working correctly, let's now allow the user to be able to delete any filters that have been added.

We don't want users to be able to delete the first filter, only the following filters that have been added.

We can do this by just adding a condition to only show a button to remove filters if the `searchIndex` is not equal to the first element in the `search` filter array.

```html
...
<div class="flex items-center mt-2 ml-2">
    <div v-if="searchIndex !== 0">
        <button
                @click="removeFilter(searchIndex)"
                class="mt-2 hover:bg-gray-200 rounded-full cursor-pointer"
                >
            <svg
                 class="w-5 h-5"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg"
                 >
                <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                      ></path>
            </svg>
        </button>
    </div>
</div>
</div>
</template>
<button
        class="flex items-center mx-2 px-2 py-2 bg-gray-200 text-gray-700 text-sm shadow-md rounded-lg mt-2 hover:bg-gray-300 hover:text-gray-900 rounded-full focus:outline-none cursor-pointer"
        @click="createNewFilter"

...
```

Let's create this new method which just takes in an array's index and removes that object by the index in our `search` array.

```javascript
methods: {
    //...
    removeFilter(index) {
        this.search.splice(index, 1)
    }
}

```

Now we can move on to submitting and parsing our `search` data back to our `DataTable` component and also adding an event to close our modal when the cancel button has been clicked.

```html
...
<div class="flex justify-end bg-gray-50 py-2 mt-5 px-4">
    <span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
        <button
                v-on:click="closeModal"
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
            Cancel
        </button>
    </span>
    <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
        <button
                v-on:click="applyFilters"
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-500 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
            Apply Filters
        </button>
    </span>
</div>
```

Let's now create a few new methods `closeModal` to fire an event back to our `DataTable` component and `applyFilters` which will loop through our `search` array and format the data in such a way so we can query the data in the back end and push this data to a new array `filterArr`.

```javascript
methods: {
	//...
    closeModal() {
      this.$emit("close-modal");
    },

    applyFilters() {
      let filterArr = [];
      this.search.map((filter) => {
        filterArr.push({

        });
      });
    },
}
```

And now we can specify what our object should look like and how we should format.

```javascript
methods: {
	//...
    applyFilters() {
      let filterArr = [];
      this.search.map((filter) => {
        filterArr.push({
          fromDate: filter.fromDate
            ? new Date(filter.fromDate).toISOString().substring(0, 10)
            : "",
          toDate: filter.toDate
            ? new Date(filter.toDate).toISOString().substring(0, 10)
            : "",
          column: filter.column,
          operator: this.transformOperator(filter.operator),
          value: filter.value,
        });
      });
    },
}
```

If a date range has been specified, we first need to format the date and parse the date to an ISO string format and get the `MM-DD-YYYY` date value, otherwise we can just return the current `filter` data.

No formatting is required for either the column, operator or the value.

Now we can emit a new event back to our `DataTable` component passing through the `filterArr` variable.

```javascript
methods: {
	//...
    applyFilters() {
      let filterArr = [];
      this.search.map((filter) => {
        filterArr.push({
          fromDate: filter.fromDate
            ? new Date(filter.fromDate).toISOString().substring(0, 10)
            : "",
          toDate: filter.toDate
            ? new Date(filter.toDate).toISOString().substring(0, 10)
            : "",
          column: filter.column,
          operator: filter.operator,
          value: filter.value,
        });
      });
      this.$emit("apply-filters", filterArr);
    },
}
```

Back in our `DataTable` component, we can listen for both emitted events created earlier `closeModal` and `applyFilters`

```html
<div v-if="openFilterModal">
    <AdvancedSearch
                    :columns="columns"
                    v-on:close-modal="closeModal"
                    v-on:apply-filters="applyFilters"
                    />
</div>
</div>
</template>
```

First, let's add to the `closeModal` method to set `openFilterModal` to false whenever the event is emitted.

```javascript
methods: {
//...
    closeModal() {
      this.openCreateTransactionModal = false;
      this.openEditTransactionModal = false;
      this.openConfirmDeleteModal = false;
      this.openFilterModal = false;
    },
}
```

Next, let's create the new `applyFilters` method and stringifying the filters array and then closing the modal.

```javascript
methods: {
    //...
    async applyFilters(filters) {
        await this.fetchTransactions(1, JSON.stringify(filters));
        this.openFilterModal = false;
    },
}

```

Notice that in our `fetchTransactions` method we are specifying a new argument for filters. Let's now add this to the method.

```javascript
methods: {
    //...
    async fetchTransactions(page = 1, filters = "") {
        //Fetch transactions
        const limit = this.limit;
        await this.$store.dispatch("transactions/fetchTransactions", {
            limit,
            page,
            filters,
        });
        this.loading = false;
    },
}
```

Now we can pass our `filters`argument to our `store` method `fetchTransactions` passing through the `filters` as data. By default, if no filter has been passed through to our `fetchTransactions` method, it should be an empty string.

Something that we will need to implement is giving the user the ability to see what filters have been applied to the table, as well as the ability to delete applied filters.

Back in our `appliedFilters` method, let's modify this method to set a new `data` property with the list of selected filters.

```javascript
methods: {
    //...
    async applyFilters(filters) {
        await this.fetchTransactions(1, JSON.stringify(filters));
        this.openFilterModal = false;
        this.appliedFilters = filters;
    },
}
```

And create this new `appliedFilters` data property setting it to `null` as default.

```javascript
export default {
  data: () => ({
    ///...
    appliedFilters: null,
  }),
  //...
}
```

Next, let's add the following markup which loops through `appliedFilters` and outputs the column name and depending on if a date filter was applied, that will display the date range. Otherwise the operator and value will be displayed.

```html
<div class="flex flex-1 items-center pr-4">
    <div class="relative md:w-1/3">
        <input
               v-model="searchQuery"
               type="search"
               class="w-full pl-10 pr-4 py-2 rounded-lg shadow focus:outline-none focus:shadow-outline text-gray-600 font-medium"
               placeholder="Search..."
               />
        <div class="absolute top-0 left-0 inline-flex items-center p-2">
            <svg
                 xmlns="http://www.w3.org/2000/svg"
                 class="w-6 h-6 text-gray-400"
                 viewBox="0 0 24 24"
                 stroke-width="2"
                 stroke="currentColor"
                 fill="none"
                 stroke-linecap="round"
                 stroke-linejoin="round"
                 >
                <rect x="0" y="0" width="24" height="24" stroke="none"></rect>
                <circle cx="10" cy="10" r="7" />
                <line x1="21" y1="21" x2="15" y2="15" />
            </svg>
        </div>
    </div>
    <div v-for="(filter, index) in appliedFilters"
         :key="index"
         class="flex items-center ml-4 bg-gray-100 px-4 py-1 text-sm rounded-lg hover:bg-gray-200 cursor-pointer"
         >
        <button>
            <svg
                 class="w-4 h-4 bg-gray-300 rounded-lg"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg"
                 >
                <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                      ></path>
            </svg>
        </button>
        <span class="flex items-center ml-1">
            <p class="font-semibold mr-1">{{ return filer.column.charAt(0).toUpperCase() + filter.column.slice(1); }}</p>
            <p>
              {{
                filter.column !== "date"
                  ? filter.operatorVal.concat(" ", filter.value)
                  : filter.fromDate.concat(" ", filter.toDate)
              }}
            </p>
          </span>
    </div>
</div>
```

Now, we need the ability to delete an applied filter and re-fetch our data with the new filters applied.

```html
...
<div
     v-for="(filter, index) in appliedFilters"
     :key="index"
     class="flex items-center ml-4 bg-gray-100 px-4 py-1 text-sm rounded-lg hover:bg-gray-200 cursor-pointer"
     >
    <button @click="removeFilter(index)">
...
```

Above, we are calling a new method `removeFilter` and passing in the filter's index when the delete button has been clicked.

```javascript
async removeFilter(index) {
    this.appliedFilters.splice(index, 1);
    await this.fetchTransactions(1, JSON.stringify(this.appliedFilters));
},
```

In our `removeFilter` method, we are splicing and remove an object from the `appliedFilters` array based on the index passed through and calling the `fetchTransactions` method passing through our new array of objects to filter the data from.

Let's now move over to our `vuex store` and modify our `fetchTransactions` method to also pass `filters` through as a query parameter.

`store/modules/transactions`

```javascript
export const actions = {
    async fetchTransactions({ commit }, { limit, page, filters }) {
        try {
            const { data } = await axios.get(`/api/transactions?limit=${limit}&page=${page}&filters=${filters}`)

            commit(types.FETCH_TRANSACTIONS, { transactions: data })
        } catch (e) {
            console.log("ERROR", e)
        }
    },
}
```

In our `fetchTransactions` method we start by destructuring the `filters` data being passed through and pass `filters` through as a query parameter to our `transactions` API endpoint to fetch transactions.

That's now a wrap for implementing our front end logic for applying filters, now we can move over to our back end to filter records by the applied filters.

`app/Http/Controllers/TransactionController.php`

```php
class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $filters = json_decode($request->filters);

        if($filters) {

        }
        return TransactionResource::collection(Transaction::latest()->paginate($pageLimit))->response();
    }

    //...
}
```

In our `index` method, we need to bring in the `Request` to get the current HTTP request and get the `filters` query passed through to our API endpoint. Since this query is a JSON string, we can decode this using an inbuilt function to convert this to a PHP object.

If the filter that has been passed through is not empty then we need to query our database inside this condition, otherwise return all of the data to our front end.

```php
public function index(Request $request)
{
    $filters = json_decode($request->filters);

    if($filters) {
        $query = Transaction::query();

        foreach ($filters as $filter) {
            if ($filter->column == 'date') {

            } else {

            }
        }
        return TransactionResource::collection(Transaction::latest()->paginate($pageLimit))->response();
    }
```

If filter have been passed through first we need to return an instance of a query builder using `Model::query()`. This is so we can first instantiate a query, then build up conditions based on our request filters.

Then we can loop through our `filters` array and check if the current `filter` has a column passed through as `date`, otherwise run another query.

```php
public function index(Request $request)
{
    $filters = json_decode($request->filters);

    if($filters) {
        $query = Transaction::query();

        foreach ($filters as $filter) {
            if ($filter->column == 'date') {
                $query->whereBetween('date', [Carbon::parse($filter->fromDate)->format('Y-m-d'), Carbon::parse($filter->toDate)->format('Y-m-d')]);
            } else {
				//...
            }
        }
        return TransactionResource::collection(Transaction::latest()->paginate($pageLimit))->response();
    }
```

If the filters column name is `date`, then we can use an `eloquent` `where` method called `whereBetween` to pass through a date range to get all the matching records between that range.

First we need to specify the database column name, then use carbon to parse and format both of our date strings, passing through our starting and finishing date ranges.

Next, let's cover all of our other columns and check for the `operator` passed through to perform a database query based off what was selected.

```php
//...
foreach ($filters as $filter) {
    if ($filter->column == 'date') {
        $query->whereBetween('date', [Carbon::parse($filter->fromDate)->format('Y-m-d'), Carbon::parse($filter->toDate)->format('Y-m-d')]);
    } else {
        if($filter->operator === 'equals') {
            $query->where($filter->column, '=', $filter->value);
        }
    }
}
//...
```

If the operator passed through should make an exact match (or 'equals'), then we can use the eloquent `where` method passing through the column name, operator and value.

```php
//...
foreach ($filters as $filter) {
    if ($filter->column == 'date') {
        $query->whereBetween('date', [Carbon::parse($filter->fromDate)->format('Y-m-d'), Carbon::parse($filter->toDate)->format('Y-m-d')]);
    } else {
        if($filter->operator === 'equals') {
            $query->where($filter->column, '=', $filter->value);
        } else if($filter->operator === 'contains') {
            $query->where($filter->column, 'LIKE', '%' . $filter->value . '%');
        } else if($filter->operator === 'does not contain') {
            $query->where($filter->column, 'NOT LIKE', '%' . $filter->value . '%');
        }
    }
}
//...
```

If the operator should contain or not contain a specific value, we can use a similar approach to the example above using `equals` but use `LIKE` or `NOT LIKE` and appending and applying a `%` onto each end of the value string to tell the database to accept any characters after the passed in value to check for records contain the specific search term.

```php
if($filters) {
    $query = Transaction::query();

    foreach ($filters as $filter) {
        if ($filter->column == 'date') {
            $query->whereBetween('date', [Carbon::parse($filter->fromDate)->format('Y-m-d'), Carbon::parse($filter->toDate)->format('Y-m-d')]);
        } else {
            if($filter->operator === 'equals') {
                $query->where($filter->column, '=', $filter->value);
            } else if($filter->operator === 'contains') {
                $query->where($filter->column, 'LIKE', '%' . $filter->value . '%');
            } else if($filter->operator === 'does not contain') {
                $query->where($filter->column, 'NOT LIKE', '%' . $filter->value . '%');
            }
        }
    }
    return TransactionResource::collection($query->paginate($pageLimit));
}
```

Now we can return our query as a collection and paginate the results.

This filter builder is still fairly basic and can be modified and improved upon to include more operators to filter records by such as including a range of numbers to filters by, checking for columns that are blank or not blank and more. I encourage you to play around with this by adding more filters and improve upon the process.