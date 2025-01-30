type ReplacePlaceholdersSubstitutions<T> = T extends {}
  ? keyof T extends never
    ?
        | never
        | "There is no reason to directly invoke this function and commit substitutions field"
    : NoInfer<T>
  : NoInfer<T>;

type ReplacePlaceholdersArgs<T> = {
  placeholder: string;
  substitutions?: ReplacePlaceholdersSubstitutions<T>;
};

// Só faz sentido caso seja necessário mais parâmetros, por mais que funcione, fica muito complexo sem necessidade
// Provavelmente seria melhor simplesmente usar a versão simples `simplePlaceholders`
function replacePlaceholders<
  T = "Please provide a type parameter for substitutions" // Garante que T deve ser explicitamente fornecido
>({ placeholder, substitutions }: ReplacePlaceholdersArgs<T>): string {
  console.log("replacePlaceholders invoked with", {
    placeholder,
    substitutions,
  });
  return "";
}

// Esse faz mais sentido no momento, é simples e direto
function simplePlaceholders<
  T = "Please provide a type parameter for substitutions"
>(placeholder: string, substitutions?: NoInfer<T>): string {
  console.log(substitutions);
  return "";
}

type ParseLocaleSubstitutions<T> = T extends {}
  ? keyof T extends never
    ?
        | never
        | "Substitutions cannot be an empty object. If you do not have substitutions, omit this field instead of using an empty object."
    : NoInfer<T>
  : NoInfer<T>;

type ParseLocalePlaceholdersArgs<T> = {
  placeholder: string;
  substitutions?: ParseLocaleSubstitutions<T>;
};

function parseLocale<
  T = "Please provide a type parameter for substitutions" // Garante que T deve ser explicitamente fornecido
>({ placeholder, substitutions }: ParseLocalePlaceholdersArgs<T>) {
  console.log("parseLocale invoked with", {
    placeholder,
    substitutions,
  });

  if (substitutions) {
    // Aqui o cast é necessário somente por estarmos especificando mensagens de feedback (linhas 3 e 33), se deixassemos apenas `never`
    // Não ia dar problema, mas ficaria bem mais difícil de entender o problema de tipagem ao passar um objecto vazio como tipo generico (<{}>)
    // Exemplos das linha 75 e 102
    replacePlaceholders<T>({
      placeholder,
      substitutions: substitutions as ReplacePlaceholdersSubstitutions<T>,
    });

    simplePlaceholders<ParseLocaleSubstitutions<T>>(placeholder, substitutions);
  }
  // retorna o componente parseado
  return null;
}

// ❌ Dá erro: 'substitutions' não é opcional
replacePlaceholders({ placeholder: "" });

// ✅ Funciona: 'substitutions' presente e T explicitamente fornecido
replacePlaceholders<{ query: string }>({
  placeholder: "",
  substitutions: { query: "test" },
});

// ❌ Dá erro: 'substitutions' fornecido sem explicitar T
replacePlaceholders({ placeholder: "", substitutions: { parity: 10 } });

// ❌ Dá erro: 'substitutions' fornecido como um objeto vazio
replacePlaceholders<{}>({ placeholder: "", substitutions: { parity: 10 } });

// ✅ Funciona: 'substitutions' é opcional
simplePlaceholders("");

// ✅ Funciona: 'substitutions' presente e T explicitamente fornecido
simplePlaceholders<{ query: string }>("", { query: "test" });

// ❌ Dá erro: 'substitutions' fornecido sem explicitar T
simplePlaceholders("", { parity: 10 });

// ❌ Dá erro: 'substitutions' fornecido como um objeto vazio
simplePlaceholders<{}>("", { parity: 10 });

// ✅ Funciona: 'substitutions' é opcional
parseLocale({ placeholder: "" });

// ❌ Dá erro: 'substitutions' fornecido sem explicitar T
parseLocale({ placeholder: "", substitutions: { parity: 10 } });

// ✅ Funciona: 'substitutions' presente e T explicitamente fornecido
parseLocale<{ query: string }>({
  placeholder: "",
  substitutions: { query: "test" },
});

// ❌ Dá erro: 'substitutions' fornecido como um objeto vazio
parseLocale<{}>({ placeholder: "", substitutions: { parity: 10 } });

/*

Em resumo:
1. Usar replacePlaceholders apenas no caso de precisar de diversos parâmetros
2. simplePlaceholders é mais fácil simples e direto (mais fácil de entender), porém é um poucos mais limitado
  no quesito se não ser um objecto (não é tão fácil de adicionar mais parametros, sendo eles opcionais ou não)
3. parseLocale é um pouco complexo de entender, mas precisa ser feito dessa forma (permite adicionar outros valores facilmente)
parseLocale pode usar tanto replacePlaceholders como simplePlaceholders
4. Quanto a especificar mensagens de feedback, deixa o erro muito mais legível, porém obriga o uso de cast

OBS: Definir as funções dessa forma, vai tornar o uso delas um pouco 'chato/moroso', porém uma vez que 
  força a definição de tipagens para todos os substitutions utilizados, deve diminuir bastante o erro humano.

OBS: Ainda é possível burlar a tipagem usando 'any | unknown' como tipagem generica, mas ai o cara teve que fazer força.
*/
