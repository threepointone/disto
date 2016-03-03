

QueryRoot
  = ws '[' ws
    exprs:QueryExpr*
    ws ']' ws
    {return {type: 'root', children: exprs}}


QueryExpr
  = x:(JoinExpr
  / ParamExpr
  / IdentExpr
  / KeyWord)
  { return x }

ParamExpr
  = ws '\''
    q:(QueryExpr
  / KeyWord)
    ws
    p:ParamMapExpr
  { return {...q, params: p }}

ParamMapExpr
  = ws '{' ws
    params:Param*
    ws '}' ws
    { return params.reduce((o, x) => ({...o, ...x}), {}) }

Param
  = k:KeyWord
    j:Value
    ws
    { return {k: j}}

JoinExpr
  = ws '{' ws
    j:JoinUnit*
    ws '}' ws
    {
      return {
        type: 'join',
        children: Array.isArray(j) ? j : ((j==='...' || (!isNaN(parseFloat(j)) && isFinite(j))) ? null : j )
      }
    }

JoinUnit
  = f:(IdentExpr
  / KeyWord)
    ws
    l:(QueryRoot
  / UnionExpr
  / RecurExpr)
  { return l.type === 'root' ? l.children : l  }

RecurExpr
  = '...'
  / number

UnionExpr
  = ws '{' ws
    u:UnionUnit+
    ws '}' ws
    {return {type: 'union', children: u }}


UnionUnit
  = t:KeyWord
    ws ':' ws
    r:QueryRoot
    {return {type: 'union-entry', union: t, query: r, children: r.children }}


IdentExpr
  = ws '[' ws
    k:KeyWord
    ws
    v:Value
    ws ']' ws
    {return {type: 'prop', dispatch: k.key, key: v}}


KeyWord = ws k:[A-Za-z0-9]+ ws { return {type: 'prop', dispatch: k.join(''), key: k.join('')}}

Value = number / string

JSON_text
  = ws value:value ws { return value; }

begin_attrs     = ws "(" ws
end_attrs       = ws ")" ws
begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

/* ----- 3. Values ----- */

value
  = false
  / null
  / true
  / object
  / array
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

/* ----- 4. Objects ----- */

object
  = begin_object
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      {
        var result = {}, i;

        result[head.name] = head.value;

        for (i = 0; i < tail.length; i++) {
          result[tail[i].name] = tail[i].value;
        }

        return result;
      }
    )?
    end_object
    { return members !== null ? members: {}; }

member
  = name:string name_separator value:value {
      return { name: name, value: value };
    }

/* ----- 5. Arrays ----- */

array
  = begin_array
    values:(
      head:value
      tail:(value_separator v:value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }

/* ----- 6. Numbers ----- */

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point = "."
digit1_9      = [1-9]
e             = [eE]
exp           = e (minus / plus)? DIGIT+
frac          = decimal_point DIGIT+
int           = zero / (digit1_9 DIGIT*)
minus         = "-"
plus          = "+"
zero          = "0"

/* ----- 7. Strings ----- */

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape         = "\\"
quotation_mark = '"'
unescaped      = [^\0-\x1F\x22\x5C]

/* ----- Core ABNF Rules ----- */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i