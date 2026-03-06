def fibo(n):
    if n == 1 or n == 0:
        return 1
    else:
        return fibo(n-1) + fibo(n-2)
    
def imprimirHola():
    print("Hola Mundo, como estas?")


def imprimirHastaN(n):
    for i in range(0, n):
        print(f"numero: {i}")