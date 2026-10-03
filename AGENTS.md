<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep catalog data behind the provider-neutral ExternalGame contract. The current catalog is supplied from Playgama; do not invent or mock game entries, and retain each game's external play URL and host attribution.
- Keep ZChat authentication disconnected until the existing project's public configuration and redirect settings are explicitly authorized, because browser sessions cannot safely be assumed to transfer between sites.
