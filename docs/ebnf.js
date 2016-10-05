
// expression
// XXX not impl `expression = assignment-expression [",", assignment-expression];`
expression = assignment-expression;

// assignment operation
// XXX not impl `assignment-expression = (left-hand-side-expression, assignment-operator, assignment-expression) | conditional-expression;`
assignment-expression = conditional-expression;

// assignment operation
// XXX not impl `conditional-expression = logical-or-expression, ["?", assignment-expression ":" assignment-expression]`
conditional-expression = logical-or-expression;

// logical operation
logical-or-expression = logical-and-expression, ["||", logical-and-expression];
logical-and-expression = bit-calc-expression, ["&&", bit-calc-expression];

// bitwise operation
bitwise-or-expression = bitwise-xor-expression, ["|", bitwise-xor-expression];
bitwise-xor-expression = bitwise-and-expression, ["^", bitwise-and-expression];
bitwise-and-expression = equality-expression, ["&", equality-expression];

// compare operation
equality-expression = relation-expression, ["==|!=", relation-expression];
relation-expression = additive-expression, ["<|<=|>|>=", additive-expression];

// calclate operation
additive-expression = multiplicative-expression, ["[+-]", multiplicative-expression];
multiplicative-expression = left-hand-side-expression, ["[*/%]", left-hand-side-expression];

// XXX
left-hand-side-expression = call-expression | member-expression;

// call operation
// XXX not impl `call-expression = member-expression, arguments, [{call-expression-part}]`;
call-expression = member-expression, arguments;
arguments = "(", [argument-list], ")";
argument-list = assignment-expression, [{",", assignment-expression}];

// member operation
// XXX not impl `member-expression = ((function-expression | primary-expression), [member-expression-part]) | allocation-expression;`
// XXX not impl `member-expression-part = ("[", expression, "]") | (".", identifer);`
member-expression = primary-expression, [{member-expression-part}];
member-expression-part =
	  "[", expression, "]"
	| ".", identifer;

// primary expression
primary-expression =
	  "this"
	| primitive
	| identifer
	| literal
	| "(", expression, ")";

// primitive structures
primitive =
	  type-string
	| type-byte
	| type-short
	| type-float
	| type-int;
type-string = "string";
type-byte = "byte";
type-short = "short";
type-float = "float";
type-int = "int";

// literal identifers
literal =
	  string
	| hex-byte
	| hex-short
	| hex-int
	| decimel
	| number;
string = "'", "[^']", "'";
hex-byte = "0x", {hex-digit}{2};
hex-short = "0x", {hex-digit}{4};
hex-int = "0x", {hex-digit}{8};
decimel = signed-decimel;
number = signed-number;

// string of identifers
identifer = "[$_]" | alphabet, [{character}];
character = alphabet | digit | character-symbol;

alphabet = "[a-zA-Z]";
character-symbol = "[$_]";

// number of identifers
signed-decimel = signed-number, "[.]", {digit};
signed-number = [sign], natural-number;
natural-number = "0" | {digit};

sign = "[-+]";
digit = "[0-9]";
hex-digit = "[0-9a-fA-F]"

// token
token-identifer = identifer;
token-string = ("'", "[^']*", "'") | ("\"", "[^\"]", "\"");
token-boolean = "false/true";
token-punctuator = token-punctuator-symbol-multiple | token-punctuator-symbol-one;
token-numeric = "(0|[1-9])[0-9]*(\.[0-9]+)?";
token-ignore = token-white-space;
token-keyword = token-keyword-flow | token-keyword-descralation | token-keyword-other;

token-keyword-flow = "if|else|switch|case|default|for|in|of|do|while|return|break|continue|try|catch|finally|throw"
token-keyword-decralation = "static|function|class|var|let|const"
token-keyword-other = "typeof|instanceof|new|delete|this|with|void|debugger"
token-punctuator-symbol-multiple = "<=|>=|==|!=|&&|[|]{2}"
token-punctuator-symbol-one = "[\-=\/,.;:'\"+*_&|^%!?(){}\[\]]";
token-white-space = "[ \t\n]";
