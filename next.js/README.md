# Next.js Bazel example

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and then Bazelified.

TypeScript transpilation and type checking has been broken out into fine-grained `ts_project` targets.
This is a small example with only two Typescript source directories so the performance benefit of using fine grained targets will be negligible here.

In a large application or monorepo, splitting Typescript transpilation & type checking across many targets can speed up the build with parallelization and caching. It also allows for massive parallelization with remote execution. Read
https://blog.aspect.dev/typescript-with-rbe for more information on using remote execution with Typescript.

NB: The example is not 100% complete and there are some minor TODOs in the code including a TODO for running linting under Bazel.

## Usage

The `package.json` scripts have been updated to call Bazel instead of Next.js so these scripts can be
used as they would be in a typical Next.js configuration.

### Setup

First run `pnpm install`. Bazel itself doesn't depend on the `node_modules` folder layed out in the
source tree but it is needed so your editor can find typings and for running `ibazel` without having
to install it globally. `ibazel` is a wrapper around bazel that adds watch mode used when running the
devserver.

### Building

Run `pnpm run build`. This runs `bazel build //apps/alpha:next`, the Bazel equivalent of running `next build`.
The output `.next` folder can be found under `bazel-bin/apps/alpha/.next`.

### Production server

Run `pnpm run start`. This runs `ibazel run //apps/alpha:next_start`, the Bazel equivalent of running `next start`.

### Development server

Run `pnpm run dev`. This runs `ibazel run //apps/alpha:next_dev`, the Bazel equivalent of running `next dev`.

### Linting

Run `pnpm run lint`. This run `bazel test //apps/alpha/... --test_tag_filters=lint --build_tests_only`, the Bazel equivalent of running `next lint`.

### Running tests

Run `pnpm run test`. This runs `bazel test //apps/alpha/... --test_tag_filters=jest --build_tests_only`, the Bazel equivalent of running `jest`.

### Exporting

Run `pnpm run export`. This runs `bazel build //apps/alpha:next_export`, the Bazel equivalent of running `next export`.
The output `out` folder can be found under `bazel-bin/apps/alpha/out`.

NB This target will fail on some systems or cause unnecessary rebuilds of the `.next` target due to `next export` writing
back to the `.next` input directory which is write-protected input under Bazel. See https://github.com/vercel/next.js/issues/43344.

TODO: Fix issue in Next.js (https://github.com/vercel/next.js/issues/43344) or find work-around.

### Styles

This example only has the .css styles generated by [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). These don't require any build steps. Showing how to create fine grained
targets to pre-process `.scss` and `.less` into `.css` would be useful in this example in the future.

TODO: add .scss and/or .less styles and pre-process targets

### Releasing and deploying

This examples doesn't directly cover releasing and deploying a Next.js application built with Bazel
but it should not diverge much from releasing and deploying a Next.js application built outside of Bazel
since the output of the Bazel build is the shape as the output you would get from running the vernacular
Next.js tooling, namely a `.next` folder with all of the output artifacts that application is
comprised of:

```
$ pnpm run build

> next.js@0.1.0 build /Users/greg/aspect/rules/bazel-examples/next.js
> bazel build //:build

INFO: Analyzed target //:build (0 packages loaded, 0 targets configured).
INFO: Found 1 target...
Target //:build up-to-date:
  bazel-bin/.next
INFO: Elapsed time: 0.260s, Critical Path: 0.00s
INFO: 1 process: 1 internal.
INFO: Build completed successfully, 1 total action

$ ls -la bazel-bin/.next
total 608
drwxr-xr-x  16 greg  wheel     512 28 Sep 14:06 .
drwxr-xr-x  11 greg  wheel     352 28 Sep 14:06 ..
-rw-r--r--   1 greg  wheel      21 28 Sep 14:06 BUILD_ID
-rw-r--r--   1 greg  wheel    1078 28 Sep 14:06 build-manifest.json
drwxr-xr-x   5 greg  wheel     160 28 Sep 14:06 cache
-rw-r--r--   1 greg  wheel      93 28 Sep 14:06 export-marker.json
-rw-r--r--   1 greg  wheel     441 28 Sep 14:06 images-manifest.json
-rw-r--r--   1 greg  wheel  103383 28 Sep 14:06 next-server.js.nft.json
-rw-r--r--   1 greg  wheel      20 28 Sep 14:06 package.json
-rw-r--r--   1 greg  wheel     312 28 Sep 14:06 prerender-manifest.json
-rw-r--r--   1 greg  wheel       2 28 Sep 14:06 react-loadable-manifest.json
-rw-r--r--   1 greg  wheel    2598 28 Sep 14:06 required-server-files.json
-rw-r--r--   1 greg  wheel     335 28 Sep 14:06 routes-manifest.json
drwxr-xr-x  10 greg  wheel     320 28 Sep 14:06 server
drwxr-xr-x   5 greg  wheel     160 28 Sep 14:06 static
-rw-r--r--   1 greg  wheel  115279 28 Sep 14:06 trace
```

When built with Bazel, this folder doesn't end up as `.next` in your source tree
because Bazel doesn't write output files to the source tree. Instead the folder can be found
via the `bazel-bin` symlink create by Bazel as `bazel-bin/.next`. You release and deploy tooling
would use this folder after running the Bazel build.
