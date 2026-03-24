# Python Code Rules — Curated DO/DO NOT Reference

**Load when**: stack contains Python, FastAPI, Django, or Flask; generating code-rules.md for Python projects; or verifying Python files.

---

## Type Annotations

- DO: annotate all public function signatures — parameters and return type
- DO: use `Optional[X]` (or `X | None` in Python 3.10+) for nullable values
- DO: use `TypeVar` for generic functions rather than `Any`
- DO: use `TypedDict` or `dataclasses` for structured dicts
- DO NOT: use bare `Any` from typing — use `object` or a proper type
- DO NOT: omit return type on public functions — `-> None` is explicit and correct

## Functions and Classes

- DO NOT: use mutable default arguments — `def f(x: list = None)` with `if x is None: x = []`
  - Bad: `def append(item, lst=[])`
  - Good: `def append(item, lst: list | None = None) -> list`
- DO: use dataclasses for data-only classes — `@dataclass(frozen=True)` for immutable
- DO: use `@staticmethod` and `@classmethod` correctly — don't use `self` if not needed
- DO: keep functions under 30 lines — extract helpers when longer
- DO NOT: use wildcard imports — `from module import *` pollutes the namespace

## Error Handling

- DO: catch specific exception types — `except ValueError` not `except Exception`
- DO: never use bare `except:` — it catches `SystemExit` and `KeyboardInterrupt`
- DO: re-raise with context when wrapping — `raise ServiceError("msg") from original_error`
- DO: use custom exception classes that inherit from `Exception` for domain errors
- DO NOT: silence exceptions with `pass` — log and re-raise or handle explicitly

## Imports and Modules

- DO: use absolute imports — `from myapp.users.service import UserService`
- DO: group imports: stdlib → third-party → local, separated by blank lines
- DO: use `pathlib.Path` not `os.path` for all file system operations
- DO NOT: use circular imports — restructure dependencies to break the cycle
- DO NOT: import inside functions (exception: breaking circular deps or lazy loading)

## String Formatting

- DO: use f-strings for string interpolation — `f"Hello, {name}!"`
- DO NOT: use `%` formatting or `.format()` in new code
- DO: use triple-quoted strings for multiline strings
- DO NOT: concatenate strings in a loop — use `"".join(parts)` or a list

## Context Managers and Resources

- DO: use `with` for all file I/O, database connections, and lock acquisition
- DO: implement `__enter__`/`__exit__` (or `@contextmanager`) for custom resources
- DO NOT: leave files or connections open without explicit close or `with` block

## FastAPI (if applicable)

- DO: define Pydantic models for all request bodies and responses
- DO: use `Annotated` for dependency injection — `Depends()` in type position
- DO: return typed response models — `response_model=UserResponse`
- DO: use `HTTPException` with specific status codes and detail messages
- DO NOT: return raw dicts from route functions — use Pydantic response models
- DO NOT: put business logic in route handlers — delegate to service layer
- DO NOT: access `request.body()` directly when a Pydantic body model suffices

## Testing

- DO: use `pytest` fixtures for setup, not `setUp`/`tearDown` methods
- DO: name test functions `test_{what}_{condition}_{expected_outcome}`
- DO: use `pytest.raises` as context manager for exception testing
- DO NOT: test implementation details — test behavior and outcomes
