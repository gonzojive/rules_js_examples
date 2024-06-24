import { one } from '@bazel-poc/one';
import { shared } from '@bazel-poc/shared';
import { getRandomQuote } from 'inspirational-quotes';
import quotes from 'star-wars-quotes';
// fails; see BUILD.bazel for intent. I tried to make this resolve with
// dep on "//issue706/clock:node_modules/@myapp/clock".
import heyThere from '@myapp/clock';

shared();
one();
console.log(getRandomQuote());
console.log(quotes());
console.log(heyThere());
