# Test Isolation Guide
**Version:** v0.7.1
Tests must be: **Independent** (pass/fail regardless of other tests), **Repeatable** (same result every run), **Self-contained** (set up and clean up own data).
## Mocking External Dependencies
**When to Mock:** External APIs, third-party services, system clock/time, random number generators
**Pattern: Replace with Test Double**
```python
def test_user_creation():
    mock_email = Mock()
    user_service = UserService(email_service=mock_email)
    user_service.create_user("test@example.com")
    mock_email.send.assert_called_once()
```
- Mock at boundaries (APIs, databases, file system)
- Inject dependencies to enable mocking
- Verify mock was called correctly
## Test Doubles
| Type | Purpose | Use When |
|------|---------|----------|
| **Stub** | Returns fixed data | Need predictable input |
| **Mock** | Verifies interactions | Testing calls were made |
| **Fake** | Simplified implementation | Need working but fast version |
| **Spy** | Records calls to real object | Need real behavior + verification |
```
Need predictable data? -> Stub
Need to verify calls? -> Mock
Need real-ish behavior? -> Fake
Need both real + verify? -> Spy
```
## Database Isolation
### Pattern 1: Transaction Rollback
```python
def setUp(self):
    self.transaction = db.begin()
def tearDown(self):
    self.transaction.rollback()
```
**Pros:** Fast, automatic cleanup | **Cons:** Can't test commit behavior
### Pattern 2: Fresh Database Per Test
```python
def setUp(self):
    db.create_all()
def tearDown(self):
    db.drop_all()
```
**Pros:** Complete isolation | **Cons:** Slower
### Pattern 3: In-Memory Database
```python
TEST_DATABASE_URL = "sqlite:///:memory:"
```
**Pros:** Very fast, no cleanup | **Cons:** May differ from production DB
- Never share database state between tests
- Each test creates its own data
- Clean up in tearDown, not setUp
## File System Isolation
### Pattern 1: Temporary Directories
```python
import tempfile
def setUp(self):
    self.temp_dir = tempfile.mkdtemp()
def tearDown(self):
    shutil.rmtree(self.temp_dir)
```
### Pattern 2: Mock File Operations
```python
@patch('builtins.open', mock_open(read_data='test content'))
def test_file_reading(self, mock_file):
    result = read_config_file()
    assert result == 'test content'
```
- Never write to real project directories
- Use temp directories or mocks
- Clean up created files in tearDown
## State Isolation Checklist
**Before each test:**
- [ ] Database in known state
- [ ] No leftover files
- [ ] Global variables reset
- [ ] Mocks configured fresh
- [ ] Time/random mocked if needed
**After each test:**
- [ ] Database rolled back/cleaned
- [ ] Temp files deleted
- [ ] Mocks reset
- [ ] Resources released
## Common Mistakes
- **Shared test data** - Each test should create its own data
- **Forgetting cleanup** - Always clean up in tearDown
- **Order-dependent tests** - Tests must pass in any order
## Quick Reference
| What to Isolate | How |
|-----------------|-----|
| External APIs | Mock/Stub |
| Database | Transaction rollback or fresh DB |
| File system | Temp directories or mock |
| Time | Mock datetime/clock |
| Random values | Fixed seed or mock |
| Global state | Reset in setUp/tearDown |
