---
title: Build a datatable with Laravel, Vuejs and Tailwind Part 3
date: '2021-03-01'
tags: ['laravel', 'vuejs', 'tailwindcss', 'datatable']
draft: false
summary: In this series, we will go through the process of building a data-table with VueJS & Laravel. We will be covering a wide range of topics such as performing CRUD operations, searching, sorting and advanced filtering to give you a good base to build upon, improve and modify to meet the requirements of your application.
---

Depending on the amount of data in our table we want to display to a user, we might decide to show all content at once, or show only a specific part of a bigger data set. The main reason behind showing only a specific range of our data is that we want to keep our applications as performant as possible and prevent fetching a large amount of data being fetched from our database and rendered on the page.

If we decide to show our data in "chunks", then we need to navigate through this collection of data into a specific number of pages, saving users from being overwhelmed by a large amount of data on one page.

Pagination is a great use case for a component, so we will go through the process of creating a component that displays displays a list of pages and fetches additional transactions when we click on a specific page to be displayed.

Let's create a `Pagination.vue` component in our `Components` folder and copy the following markup into that file.

`Pagination.vue`

```html
<template>
  <div class="flex items-center py-4 w-64">
    <div class="flex items-center">
      <a
        href="#"
        class="mr-4 px-2 py-2 inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 focus:outline-none transition ease-in-out duration-150"
      >
        <svg
          class="mr-3 h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
        Previous
      </a>
    </div>
    <ul class="flex pl-0 list-none rounded my-2">
      <li v-for="page in meta.last_page" :key="page">
        <a
          href="#"
          class="px-3 py-2 text-center inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none transition ease-in-out duration-150"
        >
          {{ page }}
        </a>
      </li>
    </ul>
    <div class="flex justify-end">
      <a
        href="#"
        class="ml-4 px-2 py-2 inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 focus:outline-none transition ease-in-out duration-150"
      >
        Next
        <svg
          class="ml-3 h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: ["meta"],

};
</script>
```

Now, in our `DataTable` component, we can import that component, and render it under our table.

`DataTable.vue`

```javascript
import Pagination from "./Components/Pagination";

//...
```

```javascript
//...
components: {
	//...
	Pagination,
},
```

````html{5}
<!-- -->
</table>
</div>
    <div class="flex justify-end">
        <Pagination
        	:meta="this.transactions.meta"
        />
	</div>
</div>
<!-- -->
````

In laravel, the `paginate` method takes care of all the heavy lifting, such as number of records to display per page, number of pages, last page and the current page, which is based of the page query string argument on a HTTP request.

As shown above, we pass this meta data as through as a prop to our `Pagination` component and now we can reference the `meta` prop in our component.

```javascript
<script>
export default {
  props: ["meta"],
}
</script>
```

```html
<!-- -->
<li v-for="page in meta.last_page" :key="page">
    <a
        @click.prevent="changePage(page)"
        href="#"
        class="pr-1 px-2 py-2 inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 focus:outline-none transition ease-in-out duration-150"
    >
		{{ page }}
<!-- -->
```

In our `Pagination` component, we can now add in a new click event to each rendered page and call `changePage` while passing through the page number to that method.

`Pagination.vue`

```html
<!-- -->
<li v-for="page in meta.last_page" :key="page">
    <a
       @click.prevent="changePage(page)"
       href="#"
       class="pr-1 px-2 py-2 inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 focus:outline-none transition ease-in-out duration-150"
       >
        {{ page }}
    </a>
<!-- -->
```

We can also add this method to our `prev` and `next` buttons by getting the current page of results the user is on, and subtracting or adding 1 to the current page.

Additionally, we need to indicate to the user if the `prev` and `next` buttons are available, if so, display hovering classes, otherwise show a disabled cursor.

```html
<!-- -->
<div class="flex items-center">
        <a
          @click.prevent="changePage(meta.current_page - 1)"
          href="#"
          class="mr-2 py-2 inline-flex items-center text-sm leading-5 font-medium rounded-lg text-gray-500 focus:outline-none transition ease-in-out duration-150"
          :class="
            meta.current_page === 1
              ? 'cursor-not-allowed'
              : 'hover:text-gray-800 hover:bg-gray-100'
          "
        >
<!-- -->
```

```html
<!-- -->
<div class="flex justify-end">
    <a
       @click.prevent="changePage(meta.current_page + 1)"
       href="#"
       class="ml-2 py-1 inline-flex items-center text-sm leading-5 font-medium rounded-lg text-gray-500 focus:outline-none"
       :class="
               meta.current_page === meta.last_page
               ? 'cursor-not-allowed'
               : 'hover:text-gray-800 hover:bg-gray-100'
               "
       >
        Next
<!-- -->
```

We can now add this method which emits an event back to our `DataTable` component and passes a page through as an argument.

```javascript
  methods: {
      changePage(page) {
          this.$emit('page-change', page)
      }
  }
```

Back in our `DataTable` component, we can listen for this event and then call `fetchTransactions`

```html
<div class="flex justify-end">
    <Pagination
    	:meta="this.transactions.meta"
        v-on:page-change="fetchTransactions"
    />
</div>
```

This method can now accept the page argument which was being passed through in the `changePage` method earlier, and always setting the default page to 1.

Each time this function is now called when navigating to a new page, a dispatch function is called and calls the `fetchTransactions` function in our `vuex` store passing the `page` value

```javascript
async fetchTransactions(page = 1) {
    //Fetch transactions
    const limit = this.limit
    	await this.$store.dispatch("transactions/fetchTransactions", {
    		limit,
    		page
    	});
    this.loading = false;
},
```

In our `vuex` store, we need to modify our `fetchTransactions` function.

```javascript
...
export const actions = {
    async fetchTransactions({ commit }, { limit, page }) {
        try {
            const { data } = await axios.get(`/api/transactions?limit=${limit}&page=${page}`)

            commit(types.FETCH_TRANSACTIONS, { transactions: data })
        } catch (e) {
            console.log("ERROR", e)
        }
    },
...
```

First, we destructure the data coming through in the functions arguments `fetchTransactions({ commit }, { limit, page })`

And pass the `page` and number as a query parameter to our API endpoint ``/api/transactions?limit=${limit}&page=${page}`

Before we continue on to the next section, we need to address a bug which allows you to travel outside of the page range i.e. if you keep navigating to the next or previous pages, you can go outside of the number of pages which are available.

```javascript
...
methods: {
    changePage(page) {
        if (page <= 0 || page > this.meta.last_page) {
            return;
        }
        this.$emit("page-change", page);
    },
...
```

To prevent this issue, we can check if the `page` number that was passed through is less than or equal to 0 OR the page is greater than the last page number in our meta data.

If this condition is met, we can return and do nothing further, otherwise we emit our `page-change` event.



### Sections

Let's start off by created a new data property `pagesPerSection` that determines the amount of pages that we want to show per section.

```javascript
...
data: () => ({
    pagesPerSection: 4,
}),
...
```

Next, create a new computed property called `numberOfSections`, this method is going to divide the total amount of pages by `pagesPerSection` property that we defined above and round to the nearest integer.

Example: 25 (pages) / 4 (pagesPerSection) = 6.25 (7 by rounding up to the nearest integer)

```javascript
...
computed: {
    numberOfSections() {
        return Math.ceil(this.meta.last_page / this.pagesPerSection);
    },
...
```

We also need to find out which section the user is currently on, we can do this by getting the current page and divide that by `pagesPerSection`.

Example 1: 2 (current page) / 4 = 0.5 (1 by rounding up to nearest integer)

Example 2: 9 (current page) / 4 = 2.25 (3 by rounding up to nearest integer)

```javascript
computed: {
    ...
    currentSection() {
        return Math.ceil(this.meta.current_page / this.pagesPerSection);
    },
...
```

First, we need to get the current page that the user is on, we can get this value by calling our `currentSection` computed property and taking away 1 and multiple that value by `pagesPerSection` + 1



```javascript
pages() {
    const startPage = (this.currentSection - 1) * this.pagesPerSection + 1;
},
```

Example 1: The user is currently on section 1:

`(1 - 1 = 0) * 4 + 1` gives us a start page for that section of 1

Example 2: The user is currently on section 2:

(2 - 1 = 1) * 4 + 1 = 5

Now that we have our starting page, we need to get our last page of that section.

To do this, add another computed property called `getLastPage`

First, we check if the current section that we are on is equal to the total number of sections, if so, return the last page number from our meta data.

Otherwise, return our current section less one and multiply that by the number of sections adding on pages per section.

```javascript
computed: {
    getLastPage() {
      if (this.currentSection === this.numberOfSections) {
        return this.meta.last_page;
      }

      return (this.currentSection - 1) * this.numberOfSections + this.pagesPerSection;
    },
}
```

Example 1: (The user is currently on section 1 with a total of 4 sections and 4 pages per section)

(1 - 1 = 0) * 4 = 0 + 4 = 4

Example 2: (The user is currently on section 3 with a total of 4 sections and 4 pages per section)

(3 - 1 = 2) * 4 = 10 + 4 = 12

Now that what our start and finish pages should be for the current section that the user is on, we can create a new method `generateSectionPages` that takes in our starting page and last page adding on one as it's exclusive.

```javascript
pages() {
    const startPage = (this.currentSection - 1) * this.pagesPerSection + 1;

    return this.generateSectionPages(startPage, this.getLastPage + 1);
},
```

```javascript
methods: {
    generateSectionPages(start, end) {
    	return new Array(end - start).fill().map((_, index) => index + start);
	},
}
```

Let's break down this method above and see what's going on.

`new Array(end - start).fill()` returns an array containing a number of undefined items within based on the size of the array.

Example: `new Array(3).fill()` = `[undefined, undefined, undefined]`

`.map((_, index) => index + start)` loops through the array and adds the array's index value onto the start page value that was passed through.

Example:

```javascript
calcPageRange(start = 12, end = 15) {
    return new Array(end - start).fill().map((_, index) => index + start);
},
```

returns an array containing the following page ranges: `[12, 13, 14]`

Now that we are successfully generating an array of page numbers per section, let's change our `v-for` loop to now loop through our `pages` computed property.

```html
<ul class="flex pl-0 list-none rounded">
    <li v-for="page in pages" :key="page">
```

You should now see while being on section 1, that pages [1, 2, 3, 4] are available.

### Showing first and last pages

We also need to make sure to display the first page (on the far left) and the last page (on the far right) of our pagination list and then the remaining pages between them.

We can do this by adding in a new template tag before our generated pages list, and check if the current section that the user is on is greater than 1, if so, allow the user to navigate to page 1.

```html
...
<ul class="flex pl-0 list-none rounded">
    <template v-if="currentSection > 1">
        <a
           @click.prevent="changePage(1)"
           href="#"
           class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none"
           >
            1
            </a>
    </template>
    <li v-for="page in pages" :key="page">
...
```

We can do a very similar thing for the last page, by checking if the current section the user is on is less than the number of sections, then we can show the last page from our meta data.

```html
    </li>
        <template v-if="currentSection < numberOfSections">
            <a
               @click.prevent="changePage(meta.last_page)"
               href="#"
               class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none"
               >
                {{ meta.last_page }}
               </a>
        </template>
</ul>
```

### Navigate through sections

For navigating between sections, we can add in a new anchor tag between our dynamic template list to display `...` as our section navigation to go forward and back between sections.

For going back previous sections, we need to add a new click event to the anchor tag and call a method `navigateSection` that we will be creating shortly and passing through `prev` as an argument.

```html
...
<ul class="flex pl-0 list-none rounded">
    <template v-if="currentSection > 1">
        <a
           @click.prevent="changePage(1)"
           href="#"
           class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none"
           >
            1
            </a>
			<a
                @click.prevent="navigateSection('prev')"
                class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium rounded-lg focus:outline-none cursor-pointer"
              >
            	...
          	  </a>
    </template>
    <li v-for="page in pages" :key="page">
...
```

For going back previous sections, we need to add a new click event to the anchor tag and call a method `navigateSection` and passing through `prev` as an argument.

```html
</li>
    <template v-if="currentSection < numberOfSections">
		<a
            @click.prevent="navigateSection('next')"
            class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium rounded-lg focus:outline-none cursor-pointer"
          >
            ...
          </a>
        <a
           @click.prevent="changePage(meta.last_page)"
           href="#"
           class="px-2 py-1 text-center inline-flex items-center text-sm leading-5 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none"
           >
            {{ meta.last_page }}
           </a>
    </template>
</ul>
```

Create a new method called `navigateSection` and add a new argument `direction` which accepts either `next` or `prev` as an argument.

```javascript
methods: {
    navigateSection(direction) {
        const value = direction === "next" ? +1 : -1;
        const section = this.currentSection + value;
        const firstPageOfSection = (section - 1) * this.pagesPerSection + 1;

        this.changePage(firstPageOfSection);
    },
},
```

Depending on if the user is navigating forward a section, add 1 to the current section that the user is currently on, otherwise subtract 1.

Next, we need to determine what the first page of the navigated section that we are navigating too.

We can do this by taking our section variable, and minus 1 and take the amount of pages per section and add one to the value.

Example 1: (User is currently on section 3 and is navigating to section 2)

`(2 - 1 = 1) * 4  = 4 + 1 = 5`

Example 2: User is currently on section 3 and is navigating to section 4)

`(4 - 1 = 3) * 4 = 12 + 1 = 13`

Now that we know our first page number, we can navigate our page to the first page of the section from the calculation above.