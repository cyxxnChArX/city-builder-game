def fibo(n):
    if n == 1 or n == 0:
        return 1
    elif n == 2:
        return 2
    else:
        return fibo(n-1) + fibo(n) #quite el n-2 
