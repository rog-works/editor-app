
// expression
expression = logical-compare-expression;
logical-compare-expression = bit-calc-expression | (logical-compare-expression, "[&]{2}|[|]{2}", bit-calc-expression);
bit-calc-expression = equals-compare-expression | (bit-calc-expression, "[&|^]", equals-compare-expression);
equals-compare-expression = size-calc-expression | (equals-compare-expression, "==|!=", size-compare-expression);
size-compare-expression = addsub-calc-expression | (size-compare-expression, "<|<=|>|>=", addsub-calc-expression);
addsub-calc-expression = muldiv-calc-expression | (addsub-calc-expression, "[+-]", muldiv-calc-expression);
muldiv-calc-expression = primary-experssion | muldiv-calc-expression, "[*/%]", primary-experssion;
primary-experssion =
	  constant
	| variable
	| function
	| "(", expression, ")";

// operand
operand = primary-expression;

// operator
//   low   logical-compare-operator = "[&]{2}|[|]{2}";
//    |    bit-calc-operator = "[&|^]";
//    |    equals-compare-operator = "==|!=";
//    |    size-compare-operator = "<|<=|>|>=";
//    |    addsub-calc-operator = "[+-]";
//   high  muldiv-calc-operator = "[*/%]";

// function
function = identifer, "(", [expression, [{",", expression}]], ")"

// structure
structure = custom | primitive;

// custom structures
custom = array | reference;
array = array-identifer, "[", array-element, "]";
array-identifer = structure | variable;
array-element = variable | constant;
reference = "$", identifer;

// primitive structures
primitive =
	  string
	| byte
	| short
	| float
	| int;
string = "string";
byte = "byte";
short = "short";
float = "float";
int = "int";

// variable
variable = identifer, [{"[.]", identifer}];

// constant identifers
constant =
	  text
	| hex-byte
	| hex-short
	| hex-int
	| decimel
	| number;
text = "'", [{"."}], "'";
hex-byte = "0x", {digit}{2};
hex-short = "0x", {digit}{4};
hex-int = "0x", {digit}{8};
decimel = signed-decimel;
number = signed-number;

// string of identifers
identifer = "[$_]" | alphabet, [{character}];
character = alphabet | digit | character-symbol;

alphabet = "[a-zA-Z]";
character-symbol = "[$_:]";

// number of identifers
signed-decimel = signed-number, "[.]", {digit};
signed-number = [sign], natural-number;
natural-number = "0" | {digit};

sign = "[-+]";
digit = "[0-9]";

// token
token-identifer = identifer;
token-string = text;
token-punctuator = token-punctuator-symbol-multiple | token-punctuator-symbol-one
token-numeric = "[0-9]+(\.[0-9]+)?";
token-ignore = token-white-space;

token-punctuator-symbol-multiple = "<=|>=|==|!=|&&|[|]{2}"
token-punctuator-symbol-one = "['\"().*/%+-&|^<>=]";
token-white-space = "[ \t\n]";
