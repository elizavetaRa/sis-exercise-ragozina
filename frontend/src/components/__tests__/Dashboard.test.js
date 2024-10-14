import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

afterEach(cleanup);

// Example tests to illustrate testing of the Dashboard component. For production requires to cover all cases

describe('Dashboard Component', () => {
    test('renders the Dashboard correctly', () => {
        render(<Dashboard />);



        // Example assertions
        expect(screen.getByText('INSPIREHEP Search & Summarization')).toBeInTheDocument();
        expect(document.getElementById('search-input')).toBeInTheDocument();


    });

    test('search displays error by network issue', async () => {
        render(<Dashboard />);


        // Type "physics" in the search input
        const searchInput = screen.getByPlaceholderText('Search articles, papers, or keywords...');
        fireEvent.change(searchInput, { target: { value: 'physics' } });

        // Click on the search button
        fireEvent.click(screen.getByRole('button', { name: /search/i }));
        // Check if loading spinner appears
        expect(screen.getByRole('alert', { hidden: true })).toBeInTheDocument();

        // Wait for the error alert to be displayed
        await waitFor(() => {
            expect(document.getElementById('fetch-error')).toBeInTheDocument();
        });

    });

    test('search displays summary and results', async () => {

        // add logic for fetch mocking

        // const fakeUResponse = {
        //     "search_query": "physics",
        //     "data": [
        //         {
        //             "title": "Quantum Service-oriented Computing: A Proposal for Quantum Software as a Service",
        //             "abstract": "This book is an analysis of quantum computing, covering everything from its foundational principles to practical applications in the development of quantum services. It offers a technical and complex overview to provide the necessary knowledge to any researcher, scientist or developer who wants to get into service-oriented quantum computing.The field of quantum computing has evolved rapidly in recent years, with the potential to revolutionize the way we approach complex problems in various fields. This comprehensive guide covers the fundamental principles of quantum computing and its practical applications in the development of quantum services.Beyond theoretical knowledge, the book goes on to explore some of the challenges that quantum software developers face in today’s landscape. It addresses issues related to low-level abstractions and the absence of integration, deployment and quality assurance mechanisms in quantum software engineering. Also, it explores the principles of service-oriented computing applied to quantum computing, revealing architectural patterns adapted to quantum computing and discussing standardization and accessibility in this field. It also provides insight into streamlining the deployment process through a DevOps approach for continuous deployment of quantum services.This book will serve as a guide for all researchers, scientists and developers by providing them with an understanding of the current limitations and problems in quantum computing-oriented software development, and how to address them with software engineering techniques and tools applied to quantum computing.",
        //             "publication_date": "2024-01-01"
        //         },
        //         {
        //             "title": "Relativistic Quantum Mechanics",
        //             "abstract": "Written by two of the most prominent leaders in particle physics, Relativistic Quantum Mechanics: An Introduction to Relativistic Quantum Fields provides a classroom-tested introduction to the formal and conceptual foundations of quantum field theory. Designed for advanced undergraduate- and graduate-level physics students, the text only requires previous courses in classical mechanics, relativity, and quantum mechanics.The introductory chapters of the book summarise the theory of special relativity and its application to the classical description of the motion of a free particle and a field. The authors then explain the quantum formulation of field theory through the simple example of a scalar field described by the Klein–Gordon equation as well as its extension to the case of spin ½ particles described by the Dirac equation. They also present the elements necessary for constructing the foundational theories of the standard model of electroweak interactions, namely quantum electrodynamics and the Fermi theory of neutron beta decay. Many applications to quantum electrodynamics and weak interaction processes are thoroughly analysed. The book also explores the timely topic of neutrino oscillations.Logically progressing from the fundamentals to recent discoveries, this textbook provides students with the essential foundation to study more advanced theoretical physics and elementary particle physics. It will help them understand the theory of electroweak interactions and gauge theories.View the second and third books in this collection: Electroweak Interactions and An Introduction to Gauge Theories.Key Features of the new edition:Besides a general revision of text and formulae, three new chapters have been added.·         Chapter 17 introduces and discusses double beta decay processes with and without neutrino emission, the latter being the only process able to determine the Dirac or Majorana nature of the neutrino (discussed in Chapter 13). A discussion of the limits to the Majorana neutrino mass obtained recently in several underground laboratories is included.·         Chapter 18 illustrates the calculation of the mass spectrum of “quarkonia” (mesons composed by a pair of heavy, charm or beauty quarks), in analogy with the positronium spectrum discussed in Chapter 12. This calculation has put into evidence the existence of “unexpected” states and has led to the new field of “exotic hadrons”, presently under active theoretical and experimental scrutiny.·         Chapter 19 illustrates the Born-Oppenheimer approximation, extensively used in the computation of simple molecules, and its application to the physics of exotic hadrons containing a pair of heavy quarks, with application to the recently observed doubly charmed baryons.This eBook was published Open Access with funding support from the Sponsoring Consortium for Open Access Publishing in Particle Physics (SCOAP3).A PDF version of this book is available for free in Open Access at www.taylorfrancis.com. It has been made available under a Creative Commons Attribution-Non Commercial-No Derivatives 4.0 license.",
        //             "publication_date": "2024-01-01"
        //         },
        //     ],
        //     "count": 10,
        //     "offset": 0,
        //     "limit": 10
        // }

        // fetchMock.mockResolvedValue({ status: 200, json: jest.fn(() => fakeResponse) })

        // render(<Dashboard />);
        // // Type "physics" in the search input
        // const searchInput = screen.getByPlaceholderText('Search articles, papers, or keywords...');
        // fireEvent.change(searchInput, { target: { value: 'physics' } });

        // // Click on the search button
        // fireEvent.click(screen.getByRole('button', { name: /search/i }));
        // // Check if loading spinner appears
        // expect(screen.getByRole('alert', { hidden: true })).toBeInTheDocument();


        // expect(await document.getElementById('fetch-results-count')).toBeInTheDocument()

    });
});


