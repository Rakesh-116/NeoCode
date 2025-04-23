### ENUM Types

```
CREATE TYPE submission_status AS ENUM ('AC', 'WRONG ANSWER', 'TLE', 'RTE');
CREATE TYPE difficulty_level AS ENUM ('cakewalk', 'easy', 'easymedium', 'medium', 'mediumhard', 'hard');
CREATE TYPE score_level AS ENUM ('10', '15', '20', '25', '30', '35');
```

### Users Table

```


```

### Problem Table

```
CREATE TABLE Problem (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT NOT NULL,
  output_format TEXT NOT NULL,
  constraints VARCHAR(255),
  prohibited_keys JSONB,
  sample_testcase JSONB,
  explaination TEXT DEFAULT 'Self Explainary',
  no_of_submissions INT DEFAULT 0,
  hidden BOOLEAN DEFAULT FALSE,
  difficulty difficulty_level NOT NULL, -- ENUM type for difficulty levels
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES Users(id) ON DELETE CASCADE
);

ALTER TABLE Problem
ADD COLUMN score score_level DEFAULT '10';  -- Default score for 'cakewalk'
```

### Default Code Table

```
CREATE TABLE defaultCode (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  problem_id INT REFERENCES Problem(id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL
);
```

### Programming Languages Table

```
CREATE TABLE language (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);
```

### Testcases Table

```
CREATE TABLE testcases (
  id SERIAL PRIMARY KEY,
  testcase JSONB NOT NULL, -- Stores input-output pairs in JSON format
  problem_id INT REFERENCES Problem(id) ON DELETE CASCADE,
);
```

### Submissions Table

```
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  problem_id INT REFERENCES Problem(id) ON DELETE CASCADE,
  user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(100) NOT NULL,
  test_results JSONB NOT NULL,
  verdict submission_status NOT NULL,
  submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

ALTER TABLE submissions
ADD column execution_time varchar(255) NOT NULL

### Saved Snippets Table

```
CREATE TABLE savedSnippets(
  id SERIAL UUID,
  user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

```
CREATE TABLE Blog (
  id uuid primary key,
  title TEXT NOT NULL,
  tags TEXT[],
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES Users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES Users(id),
  visible BOOLEAN DEFAULT TRUE
);

```
