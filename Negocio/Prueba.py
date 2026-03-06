def fibo(n):
    if n <= 1:
        return 1
    else:
        return fibo(n-1) + fibo(n-2)
    
def imprimirHola():
    print("Hola Mundo")


def imprimirHastaN(n):
    for i in range(n):
        print(i)