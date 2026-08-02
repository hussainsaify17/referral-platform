<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Development and Staging Rules
- **Regression Testing**: Always perform comprehensive regression testing on both mobile and desktop views after implementing any feature or layout changes.
- **Testing Conditions**: This testing must be conducted with all developer flags and console error reporting turned on.
- **Verification**: Verify compilation, visual responsiveness, and container alignment before staging, committing, or pushing any code to remote.
