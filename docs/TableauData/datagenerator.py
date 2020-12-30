if __name__=="__main__":
    creat = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]
    bili = []
    inr = []
    na = []

    b = 1
    while b < 51:
        bili.append(b)
        b = b + 1
    i = 1
    while i < 51:
        inr.append(i)
        i = i + 1
    n = 125
    while n < 138:
        na.append(n)
        n = n + 1
    print(bili)
    print()
    print(inr)
    print()
    print(na)
    f = open("data.txt", "a")
    for b in bili:
        for i in inr:
            for n in na:
                for c in creat:
                    current = str(b)+ "," + str(i) + "," + str(c) + "," + str(n)
                    f.write(current + "\n")

    f.close()
