def fibo(n):
    if n == 1 or n == 0:
        return 1
    elif n == 2:
        return 2
    else:
        return fibo(n-1) + fibo(n-2) + fibo(n-3)
    
def salutation():
    print("Hola Mundo, como estas? La vida es buena de nuevo")
    
def imprimirHola():
    print("cambio para dañar la linea 8")
    print("git pull origin main")
    lista = [4]


    print("Hola Mundo, como estas? La vida es buena")
    print("Hola Nico y Jaco, como estas?")


def imprimirHastaN(n, mensaje):
    for i in range(0, n):
        print(f"{mensaje}: {n}")