#lang racket

(provide (all-defined-out))

(define integers-from
  (lambda (n)
    (cons-lzl n (lambda () (integers-from (+ n 1))))))

(define cons-lzl cons)
(define empty-lzl? empty?)
(define empty-lzl '())
(define head car)
(define tail
  (lambda (lzl)
    ((cdr lzl))))

(define leaf? (lambda (x) (not (list? x))))

;; Signature: map-lzl(f, lz)
;; Type: [[T1 -> T2] * Lzl(T1) -> Lzl(T2)]
(define map-lzl
  (lambda (f lzl)
    (if (empty-lzl? lzl)
        lzl
        (cons-lzl (f (head lzl))
                  (lambda () (map-lzl f (tail lzl)))))))

;; Signature: take(lz-lst,n)
;; Type: [LzL*Number -> List]
;; If n > length(lz-lst) then the result is lz-lst as a List
(define take
  (lambda (lz-lst n)
    (if (or (= n 0) (empty-lzl? lz-lst))
      empty-lzl
      (cons (head lz-lst)
            (take (tail lz-lst) (- n 1))))))

; Signature: nth(lz-lst,n)
;; Type: [LzL*Number -> T]
;; Pre-condition: n < length(lz-lst)
(define nth
  (lambda (lz-lst n)
    (if (= n 0)
        (head lz-lst)
        (nth (tail lz-lst) (- n 1)))))

;;; Q1.1
; Signature: append$(lst1, lst2, cont) 
; Type: [List * List * [List -> T]] -> T
; Purpose: Returns the concatination of the given two lists, with cont pre-processing
(define append$
 (lambda (lst1 lst2 cont)
   (if (empty? lst1)
        (cont lst2)
        (append$ (cdr lst1) lst2 (lambda (res) (cont(cons (car lst1) res))))
    )
  )
)

;;; Q1.2
; Signature: equal-trees$(tree1, tree2, succ, fail) 
; Type: [Tree * Tree * [Tree ->T1] * [Pair->T2] -> T1 U T2
; Purpose: Determines the structure identity of a given two lists, with post-processing succ/fail
;(define leaf? (lambda (x) (not (list? x))))

(define equal-trees$ 
 (lambda (tree1 tree2 succ fail)
   (cond ((and (empty? tree1) (empty? tree2)) (succ tree1));both empty? then tree1
         ((and (empty? tree1) (not (empty? tree2))) (fail tree2)) ;tree1 is empty and tree2 if not
         ((empty? tree2) (fail tree1)) ;tree1 is not empty and tree2 is empty then tree1
         ((and (leaf? (car tree1)) (leaf? (car tree2)))
          (equal-trees$ (cdr tree1) (cdr tree2) (lambda (res) (succ(cons (cons (car tree1) (car tree2)) res))) fail)) ;if both are leafs
         ((or (and (leaf? (car tree2)) (not (leaf? (car tree1))));if tree2 is leaf and tree1 not leaf =x
              (and (leaf? (car tree1)) (not (leaf? (car tree2)))));if tree1 is leaf and tree2 not leaf =y
              (fail (cons (car tree1) (car tree2)))) ;if x | y ? then fail
          ;tree1 & tree2 are not leafs and not empty
         ((equal-trees$ (car tree1) (car tree2)
                        (lambda (rest1) (equal-trees$ (cdr tree1) (cdr tree2)
                                                      (lambda (rest2) (succ(cons rest1 rest2))) fail))
                        fail)
          )
   )
 )
)
 

;;; Q2a
; Signature: reduce1-lzl(reducer, init, lzl) 
; Type: [T2*T1 -> T2] * T2 * LzL<T1> -> T2
; Purpose: Returns the reduced value of the given lazy list
(define reduce1-lzl 
  (lambda (reducer init lzl)
    (if (empty-lzl? lzl)
        init
        (reduce1-lzl reducer (reducer init (head lzl)) (tail lzl))
    )
  )
)  

;;; Q2b
; Signature: reduce2-lzl(reducer, init, lzl, n) 
; Type: [T2*T1 -> T2] * T2 * LzL<T1> * Number -> T2
; Purpose: Returns the reduced value of the first n items in the given lazy list
(define reduce2-lzl 
  (lambda (reducer init lzl n)
   (if (or (empty-lzl? lzl) (= n 0))
        init
        (reduce2-lzl reducer (reducer init (head lzl)) (tail lzl) (- n 1))
    )
  )
)  


;;; Q2c
; Signature: reduce3-lzl(reducer, init, lzl) 
; Type: [T2 * T1 -> T2] * T2 * LzL<T1> -> Lzl<T2>
; Purpose: Returns the reduced values of the given lazy list items as a lazy list
(define reduce3-lzl 
  (lambda (reducer init lzl)
    (if (empty-lzl? lzl)
        lzl
        (cons-lzl (reducer init (head lzl)) (lambda () (reduce3-lzl reducer (reducer init (head lzl)) (tail lzl))))        
    )
  )
)

;;; Q2e
; Signature: integers-steps-from(from,step) 
; Type: Number * Number -> Lzl<Number>
; Purpose: Returns a list of integers from 'from' with 'steps' jumps
(define integers-steps-from
  (lambda (from step)
    (cons-lzl from (lambda () (integers-steps-from (+ from step) step)))
  )
)

;;; Q2f
; Signature: generate-pi-approximations() 
; Type: Empty -> Lzl<Number>
; Purpose: Returns the approximations of pi as a lazy list
(define generate-pi-approximations
  (lambda ()
    (reduce3-lzl + 0 (map-lzl (lambda (a) (/ 8 (* a (+ a 2)))) (integers-steps-from 1 4)))) 
 )



