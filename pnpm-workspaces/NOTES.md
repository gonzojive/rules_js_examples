I'm looking at the implementation of esbuild to see how input files are made available to the esbuild tool: https://github.com/aspect-build/rules_esbuild/blob/7f66da46296bd42195611518308aa1a5297f3545/esbuild/private/esbuild.bzl#L293:

```starlark
    input_sources = depset(
        copy_files_to_bin_actions(ctx, [
            file
            for file in ctx.files.srcs + filter_files(entry_points)
            if not (file.path.endswith(".d.ts") or file.path.endswith(".tsbuildinfo"))
        ]) + other_inputs + node_toolinfo.tool_files + esbuild_toolinfo.tool_files,
        transitive = [js_lib_helpers.gather_files_from_js_providers(
            targets = ctx.attr.srcs + ctx.attr.deps,
            include_transitive_sources = True,
            include_declarations = False,
            include_npm_linked_packages = True,
        )],
    )

    launcher = ctx.executable.launcher or esbuild_toolinfo.launcher.files_to_run
    ctx.actions.run(
        inputs = input_sources,
        outputs = output_sources,
        arguments = [launcher_args],
        progress_message = "%s Javascript %s [esbuild]" % ("Bundling" if not ctx.attr.output_dir else "Splitting", " ".join([entry_point.short_path for entry_point in entry_points])),
        execution_requirements = execution_requirements,
        mnemonic = "esbuild",
        env = env,
        executable = launcher,
    )
```

`gather_files_from_js_providers` inspects the JSInfo structs of srcs and deps. Definitions for those:

```python
JsInfo = provider(
    doc = "Encapsulates information provided by rules in rules_js and derivative rule sets",
    fields = {
        "declarations": "A depset of declaration files produced by the target",
        "npm_linked_package_files": "A depset of files in npm linked package dependencies of this target",
        "npm_linked_packages": "A depset of NpmLinkedPackageInfo providers that are dependencies of this target",
        "npm_package_store_deps": "A depset of NpmPackageStoreInfo providers from npm dependencies of this target and the target's transitive dependencies to use as direct dependencies when linking downstream npm_package targets with npm_link_package",
        "sources": "A depset of source files produced by the target",
        "transitive_declarations": "A depset of declaration files produced by the target and the target's transitive deps",
        "transitive_npm_linked_package_files": "A depset of files in npm linked package dependencies of this target and the target's transitive deps",
        "transitive_npm_linked_packages": "A depset of NpmLinkedPackageInfo providers that are dependencies of this target and the target's transitive deps",
        "transitive_sources": "A depset of source files produced by the target and the target's transitive deps",
    },
)

NpmLinkedPackageInfo = provider(
    doc = "Provides a linked npm package",
    fields = {
        "label": "the label of the npm_link_package_store target the created this provider",
        "link_package": "package that this npm package is directly linked at",
        "package": "name of this npm package",
        "version": "version of this npm package",
        "store_info": "the NpmPackageStoreInfo of the linked npm package store that is backing this link",
        "files": "depset of files that are part of the linked npm package",
        "transitive_files": "depset of the transitive files that are part of the linked npm package and its transitive deps",
    },
)

NpmPackageStoreInfo = provider(
    doc = """Provides information about an npm package within the virtual store of a pnpm-style
    symlinked node_modules tree.
    See https://pnpm.io/symlinked-node-modules-structure for more information about
    symlinked node_modules trees.""",
    fields = {
        "root_package": "package that this npm package store is linked at",
        "package": "name of this npm package",
        "version": "version of this npm package",
        "ref_deps": "dictionary of dependency npm_package_store ref targets",
        "virtual_store_directory": "the TreeArtifact of this npm package's virtual store location",
        "files": "depset of files that are part of the npm package",
        "transitive_files": "depset of the files that are part of the npm package and its transitive deps",
    },
)
```