class ProductInfo {
  public id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class ProductStock {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

async function getProductInfo(): Promise<ProductInfo> {
  return new Promise((resolve) => {
    resolve(new ProductInfo("10"));
  });
}

async function getProductStock(): Promise<ProductInfo[]> {
  return new Promise((resolve) => {
    resolve([new ProductInfo("10")]);
  });
}

async function getProductCategory(): Promise<ProductStock> {
  return new Promise((resolve, reject) => {
    if (Math.random() * 10 > 5) {
      reject({ msg: "some error" });
    }
    resolve(new ProductStock("name"));
  });
}
async function function4(): Promise<ProductStock[]> {
  return new Promise((resolve) => {
    resolve([new ProductStock("name")]);
  });
}

type RequiredPromises = [
  Promise<ProductInfo>,
  Promise<ProductInfo[]>,
  Promise<ProductStock>
];

type OptionalPromises = [Promise<ProductStock[]>, Promise<ProductStock[]>];

type Promises = [...RequiredPromises, ...Partial<OptionalPromises>];

function processResults(
  info: ProductInfo,
  infos: ProductInfo[],
  stock: ProductStock,
  stocks: ProductStock[] | null
) {
  console.log("processResults with values: ", { info, infos, stock, stocks });
}

function getFullfilledValueOrThrow<T>(result: PromiseSettledResult<T>): T {
  if (!result || result.status === "rejected") {
    throw result.reason;
  }

  return (result as PromiseFulfilledResult<T>).value;
}

function getFullfilledValueOrNull<T>(
  result: PromiseSettledResult<T | undefined> | undefined
): T | null {
  if (!result || result.status === "rejected") {
    return null;
  }

  return (result as PromiseFulfilledResult<T>).value;
}

async function mainWithGenericErrorThrowing() {
  const promises: Promises = [
    getProductInfo(),
    getProductStock(),
    getProductCategory(),
  ];

  const someCondition = true;

  if (someCondition) {
    promises.push(...[function4()]);
  }

  try {
    const results = await Promise.allSettled(promises);
    const [result1, result2, result3, result4] = results;

    processResults(
      getFullfilledValueOrThrow<ProductInfo>(result1),
      getFullfilledValueOrThrow<ProductInfo[]>(result2),
      getFullfilledValueOrThrow<ProductStock>(result3),
      getFullfilledValueOrNull<ProductStock[]>(result4)
    );
  } catch (error) {
    // Caso cair aqui, vai ser o primeiro erro das promises obrigatórias
    console.error("Error occurred: ", error);
  }
}

// Acredito ser a melhor abordagem???
async function mainWithGenericErrorThrowing1() {
  try {
    // Esse cara é bem mais simplificado, não requer criar um sistema complexo de tipagem
    // Porém não permite tratar os erros e gerar um log detalhado
    const [requiredResult1, requiredRresult2, requiredResult3] =
      await Promise.all([
        getProductInfo(),
        getProductStock(),
        getProductCategory(),
      ]);
    const [optionalResult1, _optionalResult2] = await Promise.allSettled([
      function4(),
      function4(),
    ]);

    processResults(
      requiredResult1,
      requiredRresult2,
      requiredResult3,
      getFullfilledValueOrNull<ProductStock[]>(optionalResult1)
    );
  } catch (error) {
    // Caso cair aqui, vai ser o primeiro erro das promises obrigatórias
    console.error("Error occurred: ", error);
  }
}

async function mainWithCustomErrorThrowing() {
  const promises: Promises = [
    getProductInfo(),
    getProductStock(),
    getProductCategory(),
  ];

  const someCondition = true;

  if (someCondition) {
    promises.push(...[function4()]);
  }

  try {
    const results = await Promise.allSettled(promises);
    const [result1, result2, result3, result4] = results;

    /*                                                      */
    /* Validação opcional para lançar um erro personalizado */
    const expectedRequiredResults = 3;
    const requiredResults = results.slice(0, expectedRequiredResults);

    const actualRequiredResults = requiredResults.filter(
      (result) => result?.status === "fulfilled"
    );

    if (actualRequiredResults.length !== expectedRequiredResults) {
      throw new Error("Some of the required results hava failed!");
    }
    /* Validação opcional para lançar um erro personalizado */
    /*                                                      */

    processResults(
      getFullfilledValueOrThrow<ProductInfo>(result1),
      getFullfilledValueOrThrow<ProductInfo[]>(result2),
      getFullfilledValueOrThrow<ProductStock>(result3),
      getFullfilledValueOrNull<ProductStock[]>(result4)
    );
  } catch (error) {
    // Caso cair aqui, vai ser o erro personalizado
    console.error("Error occurred: ", error);
  }
}

mainWithCustomErrorThrowing();

mainWithGenericErrorThrowing1();

mainWithGenericErrorThrowing();
