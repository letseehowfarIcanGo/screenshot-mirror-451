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

- Keep clinic mock visits and inventory together in the shared client provider; this keeps dashboard, logging, and stock changes synchronized within a preview session.
- Store each inventory batch with an ISO expiry date and derive stock totals from quantities; this makes expiry comparisons and earliest-expiry dispensing reliable.
