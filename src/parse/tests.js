const queries = [
  'foo', { type: 'prop', key: 'foo', dispatch: 'foo' },
  '[foo 0]', { type: 'prop', 'key': [ 'foo', 0 ], dispatch: 'foo' },
  '{foo [bar]}', { type: 'join', key: 'foo', query: [ 'bar' ] },
  '{[foo 0] [bar]}', {type: 'join', 'key': ['foo', 0], dispatch: 'foo'}
  '(foo {bar 1})',
  '({foo [bar baz]} {woz ?json}))',
  '({[foo 0] [bar baz]} {woz 1}))',
  '(:do/it {woz 1})',
  '(:do/it)'
]

'foo',
['foo', 0],
['$', 'foo' ['bar']],
['join', ['foo', 0], ['bar']],
['join', 'foo', {'bar': 1}]


