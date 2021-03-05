---
title: 'Realtime updates for your Laravel and Vue apps'
date: '2021-02-28'
tags: ['laravel', 'vuejs', 'laravel-websockets']
draft: true
summary: 'Implement realtime updates to your Laravel and Vue applications with the help of the laravel-websockets package by beyond-code.'
---

Hey folks! In this post we'll have a look at building a realtime broadcasting app in Laravel. Through the following posts, we'll build a timeline application where you can post and like other users posts all in realtime.

Heads up, We'll be using Laravel, Vue & tailwindcss. This tutorial assumes you have knowledge with all of them.
Let's get started.

## The Setup

```
laravel new realtime-laravel

composer require laravel/ui

php artisan ui vue --auth

npm install && npm run dev
```

Let's start off by creating a `Timeline` component which will contain our posts timeline and a field to create new posts.

`Timeline.vue`

```vue
<template>
  <div class="">
    <CreatePost />
  </div>
</template>

<script>
import CreatePost from './CreatePost'

export default {
  components: {
    CreatePost,
  },
}
</script>
```

And our input form to create a new post.

CreatePost.vue

```vue
<template>
    <form class="" action="">
        <div class="container mx-auto">
            <div>
                <textarea
                class="w-4/6 p-2 no-outline border border-gray-400 rounded-lg"
                placeholder="Have something to say?"
                rows="5"></textarea>
            </div>
            <button class="bg-indigo-500 align-baseline font-bold text-md text-white px-4 py-2 rounded mt-2">Submit</button>
            </div>

        </div>
    </form>
</template>

<script>
    export default {
        name: 'CreatePost'
    }
</script>
```

And finally, our styling for each post.

TimelinePost.vue

```vue
<template>
  <div>
    <ul>
      <li class="border-b border-gray-200 w-3/5 ml-10 mt-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="inline-block relative">
              <div class="relative w-12 h-12 rounded-full overflow-hidden">
                <img
                  class="absolute top-0 left-0 w-full h-full bg-cover object-fit object-cover"
                  src="https://picsum.photos/id/646/200/200"
                  alt="Profile picture"
                />
                <div class="absolute top-0 left-0 w-full h-full rounded-full shadow-inner"></div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between ml-6 mt-3">
            <div class="flex items-center">
              <p class="text-gray-600 font-bold">Ben</p>
            </div>
          </div>
        </div>
        <div class="mt-4"></div>
        <div class="flex items-center justify-end mb-2">
          <span class="hover:bg-gray-200 rounded-lg px-2 hover:text-gray-900">Reply</span>
          <button class="flex items-center ml-6">
            <svg
              class="w-5 h-5 font-semibold text-green-300 hover:text-green-500 fill-current"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <span class="ml-2">56</span>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TimelinePost',
}
</script>
```

Great! that's all the styling we need. Let's now move onto creating our laravel backend.

### Post Model

Let's now create a controller and a migration for our Post model
`php artisan make:model Post -mcr`
`php artisan make:factory PostFactory`

`posts_table.php`

```php
Schema::create('posts', function (Blueprint $table) {
  $table->increments('id');
  $table->unsignedInteger('user_id')
    ->constrained()
    ->onDelete('cascade');
  $table->text('body');
  $table->timestamps();
 });
```

`Post.php`

```php
class Post extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

`PostFactory.php`

```php
use App\Post;
use App\Model;
use Faker\Generator as Faker;

$factory->define(Post::class, function (Faker $faker) {
    return [
        'body' => $faker->sentence(20)
    ];
});
```

And now setup an API route. You can either use the `web.php` or `api.php` routes in this example we'll use our `web` file to create our routes.

```php
Route::group(['prefix' => 'api'], function() {
    Route::resource('posts', 'PostController');
    Route::resource('posts/{post}/likes', 'LikeController');
});
```

We'll start off by transforming our post data into a simple structure which we will achieve using Fractal's. We can of course use Resources instead to achieve the same, but Fractal's are a bit easier and more powerful in my experience.

`php artisan make:transformer PostTransformer`

Next, navigate to `PostTransformer` and modify the following `transform` function and import the `Post` namespace.

`PostTransformer.php`

```php
public function transform(Post $post)
    {
        return [
            'id' => $post->id,
            'body' => $post->body
        ];
    }
```

This will now transform our JSON data returned by our `Post` Model and return only our `id` and `body`properties.

Let's now create a `UserTransformer` and add a `Post` relation and a function to grab a users avatar in our `User` model.

`php artisan make:transformer UserTransformer`

`User.php`

```php
class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function avatar()
    {
        return 'http://www.gravatar.com/avatar/' . md5($this->email);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

And pass in properties we want our transformer to return.

`UserTransformer.php`

```php
class UserTransformer extends TransformerAbstract
{
    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform(User $user)
    {
        return [
            'name' => $user->name,
            'user_avatar' => $user->avatar()
        ];
    }
}
```

Now that we have a user related to a post, we can include the user to our `PostTransformer`.

`PostTransformer.php`

```php
class PostTransformer extends TransformerAbstract
{
    /**
     * List of resources to automatically include
     *
     * @var array
     */
    protected $defaultIncludes = [
        'user'
    ];

    /**
     * List of resources possible to include
     *
     * @var array
     */
    protected $availableIncludes = [

    ];

    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform(Post $post)
    {
        return [
            'id' => $post->id,
            'body' => $post->body
        ];
    }

    public function includeUser(Post $post)
    {
        return $this->item($post->user, new UserTransformer());
    }
}
```

Finally, we can add an index function to get posts sorted by latest and transform our `PostTransformer` to an array.

`PostController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Post;
use Illuminate\Http\Request;
use App\Transformers\PostTransformer;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::latest()->get();

        return fractal()
            ->collection($posts)
            ->transformWith(new PostTransformer())
          	->parseIncludes([
                'user'
            ])
            ->toArray();
    }

}
```

Let's now create a simple store to handle all of our state and create an action to retrieve our data from our API.

`store.js`

```javascript
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: [],
  },

  getters: {
    posts(state) {
      return state.posts
    },
  },

  mutations: {
    POST_DATA(state, posts) {
      state.posts = posts
    },
  },

  actions: {
    async getPosts({ commit }) {
      const { data } = await axios.get('api/posts')

      commit('POST_DATA', data.data)
    },
  },
})
```

And include our `store.js` file into our main `app.js` file

app.js`

```javascript
import store from './store'
require('./bootstrap')
window.Vue = require('vue')

const files = require.context('./', true, /\.vue$/i)
files.keys().map((key) => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

const app = new Vue({
  el: '#app',
  store,
})
```

In our `Timeline` file, once our vue instance has mounted, `getPosts()` is called making an asynchronous call to our API and returns our state of post data. We can now loop through our post data and pass `post` as a prop to our `TimelinePost` component.

`Timeline.vue`

```vue
<template>
  <div class="">
    <CreatePost />

    <TimelinePost v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import CreatePost from './CreatePost'
import TimelinePost from './TimelinePost'

export default {
  components: {
    CreatePost,
    TimelinePost,
  },

  computed: {
    ...mapGetters({
      posts: 'posts',
    }),
  },

  methods: {
    ...mapActions({
      getPosts: 'getPosts',
    }),
  },

  mounted() {
    this.getPosts()
  },
}
</script>
```

Now we can simply accept our `post` prop and pass our data to the related fields.

`TimelinePost.vue`

```vue
<template>
  <div class="mt-10 w-4/6 mx-auto">
    <ul>
      <li class="border border-gray-100 rounded-lg w-3/5 ml-10 mt-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="inline-block relative">
              <div class="relative w-12 h-12 rounded-full overflow-hidden">
                <img
                  class="absolute top-0 left-0 w-full h-full bg-cover object-fit object-cover"
                  :src="post.user.data.user_avatar"
                  alt="Profile picture"
                />
                <div class="absolute top-0 left-0 w-full h-full rounded-full shadow-inner"></div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between ml-6 mt-3">
            <div class="flex items-center">
              <p class="text-gray-600 font-bold">{{ post.user.data.name }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4">
          {{ post.body }}
        </div>
        <div class="flex items-center justify-end mb-2">
          <span class="hover:bg-gray-200 rounded-lg px-2 hover:text-gray-900">Reply</span>
          <button class="flex items-center ml-6">
            <svg
              class="w-5 h-5 font-semibold text-green-300 hover:text-green-500 fill-current"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <span class="ml-2">56</span>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TimelinePost',

  props: {
    post: {
      required: true,
      type: Object,
    },
  },
}
</script>
```

**\*\*\*\***IMAGE

### Creating Posts

Let's create a new function in our `PostController` to create a new post and save to our database.

`PostController`

```php
class PostController extends Controller
{
    public function __contruct()
    {
        $this->middleware(['auth']);
    }

    public function index()
    {
        $posts = Post::latest()->get();

        return fractal()
            ->collection($posts)
            ->transformWith(new PostTransformer())
            ->parseIncludes([
                'user'
            ])
            ->toArray();
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'body' => 'required'
        ]);

        $post = $request->user()->posts()->create($request->only('body'));

        return fractal()
            ->item($post)
            ->transformWith(new PostTransformer())
            ->toArray();
    }

}
```

To prevent CORS issues with sending data back to our server, include our `api/posts` route to our `VerifyCsrfToken` middleware.

`VerifyCsrfToken.php`

```php
class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'api/posts*'
    ];
}
```

In our vuex store file, let's create a new mutation `createPost` to post the `body` of our post and commit a mutation to store our new post as the first item in our array so our post appears at the top of our page.

store.js

```javascript
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: [],
  },

  getters: {
    posts(state) {
      return state.posts
    },
  },

  mutations: {
    POST_DATA(state, posts) {
      state.posts = posts
    },

    PREPEND_POSTS(state, post) {
      state.posts.unshift(post)
    },
  },

  actions: {
    async getPosts({ commit }) {
      const { data } = await axios.get('api/posts')

      commit('POST_DATA', data.data)
    },

    async createPost({ commit }, res) {
      const { data } = await axios.post('api/posts', res)

      commit('PREPEND_POSTS', data.data)
    },
  },
})
```

Here we create an empty form body, and when our form is submitted, we send the data to our server and reset our form data.

`CreatePost.vue`

```vue
<template>
    <form class="" action="#" @submit.prevent="submit">
        <div class="container mx-auto">
            <div>
                <textarea
                class="w-4/6 p-2 no-outline border border-gray-400 rounded-lg"
                placeholder="Have something to say?"
                rows="5"
                v-model="form.body"
                ></textarea>
            </div>
            <button class="bg-indigo-500 align-baseline font-bold text-md text-white px-4 py-2 rounded mt-2">Submit</button>
            </div>

        </div>
    </form>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'CreatePost',

        data() {
            return {
                form: {
                    body: ''
                }
            }
        },

        methods: {
            ...mapActions({
                createPost: 'createPost'
            }),

            async submit() {
                await this.createPost(this.form);

                this.form.body = ''
            }
        }
    }
</script>
```

#### Likes Table

Let's setup a new `likes` table which is a polymorphic relationship, which is assigned to a post and a user.

`php artisan make:model Likes -m`

`likes_table.php`

```php
Schema::create('likes', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('like_id');
            $table->string('like_type');
            $table->unsignedInteger('user_id')
                ->constrained()
                ->onDelete('cascade');
            $table->timestamps();
        });
```

Now we can create a `likes` function, where many `likes` are related to a `Post` through the `like` as the parent model.

`Post.php`

```php
<?php

namespace App;

use App\User;
use App\Likes;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->morphMany(Likes::class, 'like');
    }
}
```

Likes.php

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Likes extends Model
{
    protected $guarded = [];

    public function like()
    {
        return $this->morphTo();
    }
}
```

Now, let's create a new `LikeController` and `store` function to create a like which is then referenced to a `Post` as the `id` each time our endpoint is hit.

`php artisan make:controller LikeController`

`web.php`

```php
Route::group(['prefix' => 'api'], function() {
    Route::resource('posts', 'PostController');
    Route::resource('posts/{post}/likes', 'LikeController');
});
```

`LikeController.php`

```php
class LikeController extends Controller
{
    public function __contruct()
    {
        $this->middleware(['auth']);
    }
    public function store(Post $post, Request $request)
    {
        $post->likes()->create([
            'user_id' => $request->user()->id
        ]);

        return fractal()
            ->item($post->fresh())
            ->transformWith(new PostTransformer())
            ->toArray();
    }
}
```

Now, in our store, let's create a new function to hit our newly created endpoint and commit an update to our state if our `like` id and our `post` id matches.

`store.js`

```javascript
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: [],
  },

  getters: {
    posts(state) {
      return state.posts
    },
  },

  mutations: {
    POST_DATA(state, posts) {
      state.posts = posts
    },

    UPDATE_POST(state, post) {
      state.posts = state.posts.map((item) => {
        if (item.id === post.id) return post
        return item
      })
    },

    PREPEND_POSTS(state, post) {
      state.posts.unshift(post)
    },
  },

  actions: {
    async getPosts({ commit }) {
      const { data } = await axios.get('api/posts')

      commit('POST_DATA', data.data)
    },

    async createPost({ commit }, res) {
      const { data } = await axios.post('api/posts', res)

      commit('PREPEND_POSTS', data.data)
    },

    async likePost({ commit }, id) {
      const { data } = await axios.post(`api/posts/${id}/likes`)

      commit('UPDATE_POST', data.data)
    },
  },
})
```

Finally, we can call and display our like count below.

`TimelinePost.vue`

```vue
<template>
  <div class="mt-10 w-4/6 mx-auto">
    <ul>
      <li class="border border-gray-100 rounded-lg w-3/5 ml-10 mt-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="inline-block relative">
              <div class="relative w-12 h-12 rounded-full overflow-hidden">
                <img
                  class="absolute top-0 left-0 w-full h-full bg-cover object-fit object-cover"
                  :src="post.user.data.user_avatar"
                  alt="Profile picture"
                />
                <div class="absolute top-0 left-0 w-full h-full rounded-full shadow-inner"></div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between ml-6 mt-3">
            <div class="flex items-center">
              <p class="text-gray-600 font-bold">{{ post.user.data.name }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4">
          {{ post.body }}
        </div>
        <div class="flex items-center justify-end mb-2">
          <span class="hover:bg-gray-200 rounded-lg px-2 hover:text-gray-900">Reply</span>
          <button @click.prevent="like" class="flex items-center ml-6">
            <svg
              class="w-5 h-5 font-semibold text-green-300 hover:text-green-500 fill-current"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <span class="ml-2">{{ post.likes }}</span>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'TimelinePost',

  props: {
    post: {
      required: true,
      type: Object,
    },
  },

  methods: {
    ...mapActions({
      likePost: 'likePost',
    }),

    like() {
      this.likePost(this.post.id)
    },
  },
}
</script>
```

## Setting up Realtime

First, let's install `laravel-websockets` which handles serverside websockets with a nice UI to debug and view event triggers.

```bash
composer require beyondcode/laravel-websockets

php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"

php artisan migrate

php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

In your `env` configuration, change the following keys.
Note: `ID` `KEY` `SECRET` can be anything. For demo purposes, we'll use `abc123` for all three fields.

`.env`

```
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=abc123
PUSHER_APP_KEY=abc123
PUSHER_APP_SECRET=abc123
PUSHER_APP_CLUSTER=mt1
```

Now, update your `broadcasting` file options to the following configurations.

`broadcasting.php`

```
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'encrypted' => false,
        'host' => '127.0.0.1',
        'port' => 6001,
        'scheme' => 'http'
    ],
],
```

Great, we're now all setup on our server and ready to go. Once your application is served, you can now visit http://your-url/laravel-websockets to view the dashboard.

`php artisan websockets:serve`

Here we setup a channel called `posts` where the `post` event is broadcasted on. The goal now is to listen for our `post` on our client side.

`php artisan make:event PostCreated`

```
class PostCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('posts');
    }
}
```

Now we can listen for an event on our `PostController` and submit a new event once our post has been created.

`PostController.php`

```
public function store(Request $request)
    {
        $this->validate($request, [
            'body' => 'required'
        ]);

        $post = $request->user()->posts()->create($request->only('body'));

        broadcast(new PostCreated($post))->toOthers();

        return fractal()
            ->item($post)
            ->transformWith(new PostTransformer())
            ->toArray();
    }
```

Now that we have setup broadcasting on our server, we need to install a couple of packages on our client side to listen for these events.

```
yarn add laravel-echo

yarn add pusher-js
```

Laravel Echo allows us to listen for any events coming from our server while pusher-js maintains a constant persistant connection with our client.

`bootstrap.js`

```
import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: false,
    wsPort: 6001,
    disabledStats: true,
    wsHost: window.location.hostname
});
```

HINT: if you recieve a CORS issue, try reverting pusher-js back to version 5.1.1

Let's now check that we can subscribe to a `post` by listening on our channel `posts` by logging out our event and creating a new post.

`bootstrap.js`

```
window.Echo.channel('posts')
    .listen('PostCreated', (event) => {
        console.log(event);
    });
```

You should now see a post object appear in your terminal window.

Now that we know we're recieving our data back in realtime, we want to format the data being sent from our event from the server to send an id back to the client and fetch that post by our `post` `id`on our client by creating a new function `broadcastWith`

`PostCreated.php`

```
    public function broadcastWith()
    {
        return [
            'post' => [
                'id' => $this->post->id
            ]
        ];
    }
```

And create a `show` function in our `PostController` to return our formatted post data.

`PostController.php`

```
    public function show(Post $post)
    {
        return fractal()
            ->collection($post)
            ->transformWith(new PostTransformer())
            ->parseIncludes([
                'user'
            ])
            ->toArray();
    }
```

And now create a new `action` in our `store` to get a singular post by `id` and prepend that post to our store.

`store.js`

```
async getPost({ commit }, id) {
  const { data } = await axios.get(`api/posts/${id}`)

  commit('PREPEND_POSTS', data.data)
},
```

When a `PostCreated` API message is created, Echo listens for our event then dispatches a `getPost` function along with the post's id.

`bootstrap.js`

```
window.Echo.channel('posts')
    .listen('PostCreated', (event) => {
        store.dispatch('getPost', event.post.id)
    });
```

### Broadcasting Likes

Great! Now that we have posts updating in realtime, let's work on getting likes working for a post. Start off by creating a new event `PostLiked` which is the same as our previous `PostCreated` event.

`php artisan make:event PostLiked`

`PostLiked.php`

```
class PostLiked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function broadcastWith()
    {
        return [
            'post' => [
                'id' => $this->post->id
            ]
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('posts');
    }
}
```

Once our like for a post has been created, setup a new broadcast event passing through that $post.

`LikeController.php`

```
public function store(Post $post, Request $request)
    {
        $post->likes()->create([
            'user_id' => $request->user()->id
        ]);

        broadcast(new PostLiked($post))->toOthers();

        return fractal()
            ->item($post->fresh())
            ->transformWith(new PostTransformer())
            ->toArray();
    }
```

Finally, add in a new `likePost` action to post a like and commit a new mutation to update our state. Now we can dispatch our `likePost` action when Echo detects an API message containing `PostLiked`.

`store.js`

```
async likePost({ commit }, id) {
    const { data } = await axios.post(`api/posts/${id}/likes`)

    commit('UPDATE_POST', data.data)
}
```

`bootstrap.js`

```
window.Echo.channel('posts')
    .listen('PostCreated', (event) => {
        store.dispatch('getPost', event.post.id)
    })
    .listen('PostLiked', (event) => {
        store.dispatch('refreshPost', event.post.id)
    })
```

### We're Done!

Congratulations on making it so far into this tutorial. This was just a simple implementation of using `laravel-websockets` in an application. For an additional challenge try improving upon this existing application that you just created. Try adding replies, friend requests or a live chat window. The possibilities are almost endless.
